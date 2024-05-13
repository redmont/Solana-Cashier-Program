import { Inject, Injectable, Logger } from '@nestjs/common';
import { Actor, createActor } from 'xstate';
import { ClientProxy } from '@nestjs/microservices';
import { sendBrokerMessage } from 'broker-comms';
import { DebitMessage, DebitMessageResponse } from 'cashier-messages';
import { QueryStoreService } from 'query-store';
import dayjs from '@/dayjs';
import { createSeriesFSM, SeriesEvent } from './fsm/series.fsm';
import { SeriesPersistenceService } from './seriesPersistence.service';
import { MatchManagementService } from '../match/matchManagement.service';
import { MatchPersistenceService } from '../match/matchPersistence.service';

import { MatchBettingService } from '../match/matchBetting.service';
import { GatewayManagerService } from '../gatewayManager/gatewayManager.service';
import { PromiseQueue } from '../promiseQueue';
import { ActivityStreamService } from '@/activityStream/activityStream.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SeriesService {
  private readonly logger = new Logger(SeriesService.name);

  private fsmInstances: Map<
    string,
    { promiseQueue: PromiseQueue; fsm: Actor<any> }
  > = new Map();

  private instanceMatches: Map<string, string> = new Map();

  constructor(
    private readonly seriesPersistenceService: SeriesPersistenceService,
    private readonly matchPersistenceService: MatchPersistenceService,
    private readonly matchBettingService: MatchBettingService,
    private readonly queryStore: QueryStoreService,
    private readonly activityStreamService: ActivityStreamService,
    private readonly matchManagementService: MatchManagementService,
    private readonly gatewayManagerService: GatewayManagerService,
    @Inject('BROKER') private readonly broker: ClientProxy,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async initialise() {
    await this.restoreState();
  }

  async restoreState() {
    const persistedSeries = await this.seriesPersistenceService.get();
    for (const series of persistedSeries) {
      this.logger.debug(`Initializing series '${series.sk}'`);
      if (!series.state) {
        // No state, so skip.
        continue;
      }

      const persistedState = JSON.parse(series.state);

      // 'done' states get stuck
      if (persistedState.value?.runMatch?.bettingOpen === 'done') {
        persistedState.value.runMatch = 'retryAllocation';
      }

      /*
      const codeName = series.sk;

      console.log('Initialising persisted state', persistedState);

      
      await this.initSeries(series.sk, series.displayName, persistedState);
      if (persistedState.value?.runMatch) {
        this.instanceMatches.set(codeName, persistedState.context.matchId);
      }*/
      await this.initSeries(series.sk, series.displayName, undefined);

      // Jump-start
      /*
      if (persistedState.value?.runMatch === 'retryAllocation') {
        this.sendEvent(codeName, 'RETRY_ALLOCATION');
      } else if (persistedState.value?.runMatch?.bettingOpen) {
        this.sendEvent(codeName, 'REOPEN_BETTING');
      } else if (persistedState.value?.runMatch === 'matchInProgress') {
        // In this case we don't have a server, so we just distribute winnings
        this.sendEvent(codeName, 'RUN_MATCH.FINISH_MATCH');
      } else if (persistedState.value === 'runMatchAfterDelay') {
        this.sendEvent(codeName, 'RUN');
      } else if (
        persistedState.value.runMatch?.bettingClosed === 'onStateChange'
      ) {
        this.sendEvent(codeName, 'RUN');
      }*/
    }
  }

  async initSeries(codeName: string, displayName: string, state?: any) {
    if (this.fsmInstances.has(codeName)) {
      throw new Error(`Series with codeName ${codeName} already exists`);
    }

    const promiseQueue = new PromiseQueue();
    const fsmInstance = createActor(
      createSeriesFSM(codeName, displayName, {
        logger: this.logger,
        getSeriesConfig: async (codeName) => {
          const x = await this.seriesPersistenceService.getOne(codeName);
          return {
            requiredCapabilities: {},
            betPlacementTime: x.betPlacementTime,
            fighters: x.fighters,
            level: x.level,
          };
        },
        setCurrentMatchId: (codeName, matchId) => {
          this.instanceMatches.set(codeName, matchId);
        },
        allocateServerForMatch: (matchId, config) =>
          this.matchManagementService.allocateServerForMatch(matchId, config),
        determineOutcome: async (
          serverId,
          capabilities,
          matchId,
          config,
          samplingStartTime,
        ) => {
          return await this.matchManagementService.determineOutcome(
            serverId,
            capabilities.finishingMoves,
            matchId,
            config,
            samplingStartTime,
          );
        },
        distributeWinnings: async (
          codeName,
          matchId,
          fighter,
          config,
          startTime,
        ) => {
          await this.matchBettingService.distributeWinnings(
            codeName,
            matchId,
            fighter,
            config,
            startTime,
          );
        },
        resetBets: async (codeName) => {
          await this.queryStore.setBets(codeName, []);
          await this.queryStore.resetCurrentMatch();

          this.gatewayManagerService.handleBetsUpdated(codeName, []);
        },
        onStateChange: async (state, context) => {
          const fighters = context.config.fighters.map(
            ({ codeName, displayName, ticker, imagePath }) => ({
              codeName,
              displayName,
              ticker,
              imagePath,
            }),
          );

          await this.seriesPersistenceService.savePublicState(
            codeName,
            context.matchId,
            fighters,
            state,
            context.startTime,
          );

          this.gatewayManagerService.handleMatchUpdated(
            codeName,
            context.matchId,
            fighters,
            state,
            context.startTime,
            context.winningFighter?.codeName,
          );
        },
        matchCompleted: async () => {
          this.eventEmitter.emit('series.matchCompleted', codeName);
        },
      }),
      {
        snapshot: state,
      },
    );
    fsmInstance.subscribe(async (state) => {
      promiseQueue.enqueue(async () => {
        const state = fsmInstance.getPersistedSnapshot();
        await this.seriesPersistenceService.saveState(
          codeName,
          JSON.stringify(state),
        );
      });
    });
    fsmInstance.start();

    this.fsmInstances.set(codeName, { fsm: fsmInstance, promiseQueue });
  }

  async createSeries(
    codeName: string,
    displayName: string,
    betPlacementTime: number,
    fighters: {
      codeName: string;
      displayName: string;
      ticker: string;
      imagePath: string;
      model: {
        head: string;
        torso: string;
        legs: string;
      };
    }[],
    level: string,
  ) {
    await this.seriesPersistenceService.create(
      codeName,
      displayName,
      betPlacementTime,
      fighters,
      level,
    );

    this.initSeries(codeName, displayName);
  }

  async updateSeries(
    codeName: string,
    displayName: string,
    betPlacementTime: number,
    fighters: {
      codeName: string;
      displayName: string;
      ticker: string;
      imagePath: string;
      model: {
        head: string;
        torso: string;
        legs: string;
      };
    }[],
    level: string,
  ) {
    await this.seriesPersistenceService.update(
      codeName,
      displayName,
      betPlacementTime,
      fighters,
      level,
    );
  }

  async getSeries(codeName: string) {
    const series = await this.seriesPersistenceService.getOne(codeName);

    if (!series) {
      return null;
    }

    const { sk, ...rest } = series;

    return { ...rest, codeName: sk };
  }

  sendEvent(codeName: string, event: SeriesEvent) {
    const fsmInstance = this.fsmInstances.get(codeName);
    if (!fsmInstance) {
      throw new Error(`Series with codeName ${codeName} does not exist`);
    }

    fsmInstance.fsm.send({ type: event });
  }

  listSeries() {
    const series = [];
    this.fsmInstances.forEach((value, key) => {
      const snapshot = value.fsm.getSnapshot();
      series.push({
        id: key,
        displayName: snapshot.context.displayName,
        state: snapshot.value,
      });
    });
    return series;
  }

  async placeBet(
    codeName: string,
    userId: string,
    walletAddress: string,
    amount: number,
    fighter: string,
  ): Promise<{ success: boolean; message?: string }> {
    const fsmInstance = this.fsmInstances.get(codeName);
    if (!fsmInstance) {
      throw new Error(`Series with code name '${codeName}' does not exist`);
    }

    const currentState = fsmInstance.fsm.getSnapshot();

    const bettingOpenState =
      typeof currentState.value === 'object' &&
      currentState.value.runMatch.bettingOpen;

    if (!bettingOpenState) {
      return { success: false, message: 'Betting is not open' };
    }

    const { matchId, config } = currentState.context;

    if (!config.fighters.find((x) => x.codeName === fighter)) {
      return {
        success: false,
        message: `Fighter '${fighter}' is not in the match`,
      };
    }

    const debitResult = await sendBrokerMessage<
      DebitMessage,
      DebitMessageResponse
    >(this.broker, new DebitMessage(userId, amount));
    if (!debitResult.success) {
      return {
        success: false,
        message: 'Failed to debit user',
      };
    }

    await this.matchPersistenceService.createBet(
      matchId,
      userId,
      amount,
      fighter,
    );

    await this.queryStore.createBet(
      currentState.context.codeName,
      walletAddress,
      amount.toString(), // todo
      fighter,
    );

    this.gatewayManagerService.handleBetPlaced(
      userId,
      dayjs.utc().toISOString(),
      currentState.context.codeName,
      walletAddress,
      amount.toString(),
      fighter,
    );

    await this.activityStreamService.track(
      currentState.context.codeName,
      matchId,
      dayjs.utc(),
      'betPlaced',
      {
        amount: amount.toString(),
        fighter,
      },
      userId,
    );

    return { success: true };
  }

  async matchCompleted(matchId: string) {
    // Find codeName by matchId
    let codeName = '';
    this.instanceMatches.forEach((value, key) => {
      if (value === matchId) {
        codeName = key;
      }
    });

    if (!codeName) {
      this.logger.warn(
        `Match '${matchId}' completed, but no associated series found. Not doing anything.`,
      );
      return;
    }

    const fsmInstance = this.fsmInstances.get(codeName);
    if (!fsmInstance) {
      this.logger.warn(
        `Match '${matchId}' of series '${codeName}' completed, but series FSM not found. Not doing anything.`,
      );
      return;
    }

    fsmInstance.fsm.send({ type: 'RUN_MATCH.FINISH_MATCH' });
  }

  gameServerDisconnected(matchId: string) {
    return this.matchCompleted(matchId);
  }
}
