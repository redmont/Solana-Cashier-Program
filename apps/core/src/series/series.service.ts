import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Actor, createActor } from 'xstate';
import { createSeriesFSM, SeriesEvent } from './series.fsm';
import { SeriesPersistenceService } from './series-persistence.service';
import { OnEvent } from '@nestjs/event-emitter';
import { MatchManagementService } from '../match/match-management.service';
import { sendBrokerMessage } from 'broker-comms';
import { DebitMessage, DebitMessageResponse } from 'cashier-messages';
import { ClientProxy } from '@nestjs/microservices';
import { MatchPersistenceService } from '../match/match-persistence.service';
import { QueryStoreService } from 'query-store';
import { MatchBettingService } from '../match/match-betting.service';
import { GatewayManagerService } from '../gateway-manager/gateway-manager.service';
import { PromiseQueue } from '../promise-queue';
import { DateTime } from 'luxon';
import { ActivityStreamService } from 'src/activity-stream/activity-stream.service';

@Injectable()
export class SeriesService implements OnModuleInit {
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
  ) {}

  async onModuleInit() {
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

      if (persistedState.context.startTime) {
        // Start time would be a string, so we need to convert it back to a date
        persistedState.context.startTime = DateTime.fromISO(
          persistedState.context.startTime,
        );
      }
      // 'done' states get stuck
      if (persistedState.value?.runMatch?.bettingOpen === 'done') {
        persistedState.value.runMatch = 'retryAllocation';
      }

      const codeName = series.sk;

      await this.initSeries(series.sk, persistedState);
      if (persistedState.value?.runMatch) {
        this.instanceMatches.set(codeName, persistedState.context.matchId);
      }

      // Jump-start
      if (persistedState.value?.runMatch === 'retryAllocation') {
        this.sendEvent(codeName, 'RETRY_ALLOCATION');
      } else if (persistedState.value?.runMatch?.bettingOpen) {
        this.sendEvent(codeName, 'REOPEN_BETTING');
      } else if (persistedState.value?.runMatch === 'matchInProgress') {
        // In this case we don't have a server, so we just distribute winnings
        this.sendEvent(codeName, 'RUN_MATCH.FINISH_MATCH');
      } else if (persistedState.value === 'runMatchAfterDelay') {
        this.sendEvent(codeName, 'RUN');
      }
    }
  }

  async initSeries(codeName: string, state?: any) {
    if (this.fsmInstances.has(codeName)) {
      throw new Error(`Series with codeName ${codeName} already exists`);
    }

    const promiseQueue = new PromiseQueue();
    const fsmInstance = createActor(
      createSeriesFSM(codeName, {
        logger: this.logger,
        setCurrentMatchId: (codeName, matchId) => {
          this.instanceMatches.set(codeName, matchId);
        },
        allocateServerForMatch: (matchId, config) =>
          this.matchManagementService.allocateServerForMatch(matchId, config),
        determineOutcome: async (serverId, capabilities, matchId, config) => {
          return await this.matchManagementService.determineOutcome(
            serverId,
            capabilities,
            matchId,
            config,
          );
        },
        distributeWinnings: async (codeName, matchId, fighter) => {
          await this.matchBettingService.distributeWinnings(
            codeName,
            matchId,
            fighter,
          );
        },
        resetBets: async (codeName) => {
          await this.queryStore.setBets(codeName, []);
        },
        onStateChange: async (state, context) => {
          await this.seriesPersistenceService.savePublicState(
            codeName,
            state,
            context.startTime,
          );

          this.gatewayManagerService.handleMatchUpdated(
            codeName,
            state,
            context.startTime,
            context.winningFighter?.codeName,
          );
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

  async createSeries(codeName: string, displayName: string) {
    await this.seriesPersistenceService.create(codeName, displayName);

    this.initSeries(codeName);
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
      series.push({
        seriesId: key,
        currentState: value.fsm.getSnapshot().value,
      });
    });
    return series;
  }

  getSeries(codeName: string) {
    const fsmInstance = this.fsmInstances.get(codeName);
    if (!fsmInstance) {
      throw new Error(`Series with codeName ${codeName} does not exist`);
    }

    const snapshot = fsmInstance.fsm.getSnapshot();
    const { matchId } = snapshot.context;

    return {
      seriesId: codeName,
      matchId,
    };
  }

  async placeBet(
    codeName: string,
    userId: string,
    walletAddress: string,
    amount: number,
    fighter: string,
  ) {
    const fsmInstance = this.fsmInstances.get(codeName);
    if (!fsmInstance) {
      throw new Error(`Series with code name '${codeName}' does not exist`);
    }

    const currentState = fsmInstance.fsm.getSnapshot();

    if (
      typeof currentState.value === 'object' &&
      !currentState.value.runMatch.bettingOpen
    ) {
      throw new Error(
        `Series with code name '${codeName}' is not in a state to place bets`,
      );
    }

    const { matchId, config } = currentState.context;

    if (!config.fighters.find((x) => x.codeName === fighter)) {
      throw new Error(`Fighter '${fighter}' is not in the match`);
    }

    const debitResult = await sendBrokerMessage<
      DebitMessage,
      DebitMessageResponse
    >(this.broker, new DebitMessage(userId, amount));
    if (!debitResult.success) {
      throw new Error('Failed to debit user');
    }

    console.log('Creating bet for match...');

    await this.matchPersistenceService.createBet(
      matchId,
      userId,
      amount,
      fighter,
    );

    console.log('Creating bet in query store');
    await this.queryStore.createBet(
      currentState.context.codeName,
      walletAddress,
      amount.toString(), // todo
      fighter,
    );

    this.gatewayManagerService.handleBetPlaced(
      userId,
      DateTime.utc().toISO(),
      currentState.context.codeName,
      walletAddress,
      amount.toString(),
      fighter,
    );

    await this.activityStreamService.track(
      currentState.context.codeName,
      matchId,
      DateTime.utc(),
      'betPlaced',
      {
        amount: amount.toString(),
        fighter,
      },
      userId,
    );

    return true;
  }

  async matchCompleted(matchId: string) {
    // Find codeName by matchId
    let codeName = '';
    this.instanceMatches.forEach((value, key) => {
      if (value === matchId) {
        codeName = key;
      }
    });

    const fsmInstance = this.fsmInstances.get(codeName);
    if (!fsmInstance) {
      throw new Error(`Series with codeName ${codeName} does not exist`);
    }

    fsmInstance.fsm.send({ type: 'RUN_MATCH.FINISH_MATCH' });

    return { success: true };
  }

  async gameServerDisconnected(matchId: string) {
    this.matchCompleted(matchId);
  }
}
