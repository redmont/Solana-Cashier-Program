import {
  BrawlersV2Croupier,
  Decimal,
  Pools,
  brawlersV2Preset,
} from '@bltzr-gg/croupier';
import { AbstractMatchOutcomeService } from './abstractMatchOutcomeService';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ConfigService } from '@nestjs/config';

export class MatchOutcomeService implements AbstractMatchOutcomeService {
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
  }
}
