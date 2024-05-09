import { Injectable, Logger } from '@nestjs/common';
import { Decimal, Pools, brawlersV2Preset } from '@bltzr-gg/croupier';
import dayjs from '@/dayjs';
import { SeriesConfig } from '../series/seriesConfig.model';
import { MatchBettingService } from './matchBetting.service';
import { AbstractMatchOutcomeService } from './matchOutcome/abstractMatchOutcomeService';
import { ServerCapabilities } from '@/series/fsm/serverCapabilities';
import { GameServerService } from '@/gameServer/gameServer.service';

const parseSeriesConfig = (config: SeriesConfig) => {
  return {
    startTime: dayjs
      .utc() // todo - how correct is this? should we be using the current time?
      .add(config.betPlacementTime, 'seconds')
      .toISOString(),
    fighters: config.fighters.map((fighter, i) => ({
      id: i,
      model: fighter.model,
      displayName: fighter.displayName,
      ticker: fighter.ticker,
    })),
    level: config.level,
  };
};

const formatSymbol = (ticker: string) => `Crypto.${ticker}/USD`;

@Injectable()
export class MatchManagementService {
  private readonly logger = new Logger(MatchManagementService.name);

  constructor(
    private readonly gameServerService: GameServerService,
    private readonly matchBettingService: MatchBettingService,
    private readonly matchOutcomeService: AbstractMatchOutcomeService,
  ) {}

  async allocateServerForMatch(
    matchId: string,
    seriesConfig: SeriesConfig,
  ): Promise<{
    serverId: string;
    capabilities: ServerCapabilities;
    streamUrl: string;
  }> {
    this.logger.log(`Allocating server for match ${matchId}...`);

    const matchParameters = parseSeriesConfig(seriesConfig);

    const result = await this.gameServerService.allocateServerForMatch(
      matchId,
      matchParameters,
    );

    return result;
  }

  async determineOutcome(
    serverId: string,
    finishingMoves: string[],
    matchId: string,
    seriesConfig: SeriesConfig,
    samplingStartTime: string,
  ): Promise<{ codeName: string; displayName: string }> {
    const bets = await this.matchBettingService.getBets(matchId);

    const pools = seriesConfig.fighters.map((fighter) => ({
      symbol: formatSymbol(fighter.ticker),
      size: new Decimal(
        bets.reduce(
          (acc, curr) => (curr.fighter === fighter.codeName ? acc + 1 : acc),
          0,
        ),
      ),
    })) as Pools;

    for (const pool of pools) {
      if (pool.size.isZero()) {
        pool.size = new Decimal(1);
      }
    }

    /*const startTime = dayjs(samplingStartTime);
    const from = new Decimal(startTime.valueOf());
    const to = new Decimal(startTime.add(10, 'seconds').valueOf());*/

    const from = dayjs().utc().add(-10, 'seconds').valueOf();
    const to = dayjs().utc().valueOf();

    this.logger.debug(
      `Generating ticket for timestamps between ${from} and ${to} for pools ${pools[0].symbol} and ${pools[1].symbol}...`,
    );

    const winner = await this.matchOutcomeService.determineOutcome(
      from,
      to,
      pools,
    );

    const matchParameters = parseSeriesConfig(seriesConfig);
    const healthValues = [0.1, 0.2, 0.3];

    const doubleKOs = finishingMoves.filter((x) => x.startsWith('KDA_'));
    const doubleKOmove =
      doubleKOs[Math.floor(Math.random() * doubleKOs.length)];
    const nonDoubleKOs = finishingMoves.filter((x) => !x.startsWith('KDA_'));

    const fighterHealth = matchParameters.fighters.map((fighter, i) => {
      let health = 0;

      const symbol = formatSymbol(fighter.ticker);
      const win = winner === symbol;

      if (win) {
        // pick a random health value
        health = healthValues[Math.floor(Math.random() * healthValues.length)];
      }

      return health;
    });

    const allDead = fighterHealth.every((health) => health === 0);

    const outcome = matchParameters.fighters.map((fighter, i) => {
      let finishingMove;
      if (allDead) {
        finishingMove = doubleKOmove;
      } else {
        finishingMove =
          nonDoubleKOs[Math.floor(Math.random() * nonDoubleKOs.length)];
      }

      const health = fighterHealth[i];

      return {
        id: i,
        health,
        finishingMove,
      };
    });

    this.gameServerService.setOutcome(serverId, matchId, outcome);

    // Winning fighter is the one with positive health, otherwise null (draw)
    const winningFighter = outcome.find((fighter) => fighter.health > 0);

    if (!winningFighter) {
      return null;
    }

    const { codeName, displayName } = seriesConfig.fighters[winningFighter.id];

    return { codeName, displayName };
  }
}
