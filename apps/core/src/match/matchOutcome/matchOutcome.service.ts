import {
  BrawlersV2Croupier,
  Decimal,
  Pools,
  brawlersV2Preset,
} from '@bltzr-gg/croupier';
import { AbstractMatchOutcomeService } from './abstractMatchOutcomeService';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export class MatchOutcomeService implements AbstractMatchOutcomeService {
  private readonly logger = new Logger(MatchOutcomeService.name);

  priceDataTableName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly dynamoDbClient: DynamoDBClient,
  ) {
    this.priceDataTableName =
      this.configService.get<string>('priceDataTableName');
  }

  async determineOutcome(
    tsFrom: number,
    tsTo: number,
    pools: Pools,
  ): Promise<{
    winner: string;
    priceDelta: Record<
      string,
      {
        relative: number;
        absolute: number;
      }
    >;
  }> {
    const from = new Decimal(tsFrom);
    const to = new Decimal(tsTo);

    const croupier = new BrawlersV2Croupier({
      dynamoDBClient: this.dynamoDbClient,
      tableName: this.priceDataTableName,
      algorithm: brawlersV2Preset.algorithm.defaultPriceAlgorithm,
    });

    croupier.setParams({
      pools,
    });

    try {
      const ticket = await croupier.generateTicket({
        timestamp: {
          from,
          to,
        },
      });

      return {
        winner: ticket.winner,
        priceDelta: ticket.data.priceDelta,
      };
    } catch (e) {
      const poolSymbols = pools.map((pool) => pool.symbol).join(', ');
      this.logger.error(
        `Error generating croupier ticket for pools '${poolSymbols}'`,
        e,
      );

      const randomWinner = pools[Math.floor(Math.random() * pools.length)];
      const priceDelta = pools.reduce((acc, curr) => {
        acc[curr.symbol] = {
          absolute: 0,
          relative: 0,
        };
        return acc;
      }, {});

      this.logger.warn(
        `Falling back to random winner '${randomWinner.symbol}'`,
      );

      return {
        winner: randomWinner.symbol,
        priceDelta,
      };
    }
  }
}
