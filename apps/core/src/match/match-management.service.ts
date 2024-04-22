import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DateTime } from 'luxon';
import { GameServerService } from '../game-server/game-server.service';
import { SeriesConfig } from '../series/series-config.model';

const parseSeriesConfig = (config: SeriesConfig) => {
  return {
    startTime: DateTime.utc().plus({ seconds: config.betPlacementTime }),
    fighters: config.fighters.map((fighter, i) => ({
      id: i,
      model: fighter.model,
      displayName: fighter.displayName,
    })),
  };
};

@Injectable()
export class MatchManagementService {
  private readonly logger = new Logger(MatchManagementService.name);

  constructor(
    private readonly gameServerService: GameServerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async allocateServerForMatch(
    matchId: string,
    seriesConfig: SeriesConfig,
  ): Promise<{
    serverId: string;
    capabilities: {
      finishingMoves: string[];
      models: {
        head: string;
        torso: string;
        legs: string;
      }[];
    };
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
    capabilities: {
      finishingMoves: string[];
      models: {
        head: string;
        torso: string;
        legs: string;
      }[];
    },
    matchId: string,
    seriesConfig: SeriesConfig,
  ): Promise<string> {
    const matchParameters = parseSeriesConfig(seriesConfig);
    const healthValues = [0.1, 0.2, 0.3];

    const doubleKOs = capabilities.finishingMoves.filter((x) =>
      x.startsWith('KDA_'),
    );
    const doubleKOmove =
      doubleKOs[Math.floor(Math.random() * doubleKOs.length)];
    const nonDoubleKOs = capabilities.finishingMoves.filter(
      (x) => !x.startsWith('KDA_'),
    );

    const fighterHealth = matchParameters.fighters.map((_, i) => {
      let health = 0;
      const win = Math.random() > 0.5;
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

    return winningFighter
      ? seriesConfig.fighters[winningFighter.id].codeName
      : null;
  }
}
