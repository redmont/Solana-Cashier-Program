import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigService } from '@nestjs/config';
import { GlobalClientsModule } from '../global-clients-module';
import { MatchPersistenceService } from './match-persistence.service';
import { MatchSchema } from './schemas/match.schema';
import { GameServerModule } from 'src/game-server/game-server.module';
import { BetSchema } from './schemas/bet.schema';
import { MatchManagementService } from './match-management.service';
import { MatchBettingService } from './match-betting.service';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { MockMatchOutcomeService } from './match-outcome/mock-match-outcome.service';
import { MatchOutcomeService } from './match-outcome/match-outcome.service';
import { AbstractMatchOutcomeService } from './match-outcome/abstract-match-outcome-service';

@Module({
  imports: [
    GlobalClientsModule,
    DynamooseModule.forFeatureAsync([
      {
        name: 'match',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: MatchSchema,
            options: {
              tableName: configService.get<string>('tableName'),
              create: configService.get<boolean>('isDynamoDbLocal'),
            },
          };
        },
        inject: [ConfigService],
      },
      {
        name: 'bet',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: BetSchema,
            options: {
              tableName: configService.get<string>('tableName'),
              create: configService.get<boolean>('isDynamoDbLocal'),
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
    GameServerModule,
  ],
  providers: [
    {
      provide: DynamoDBClient,
      useFactory: (configService: ConfigService) => {
        return new DynamoDBClient({
          endpoint: configService.get<boolean>('isDynamoDbLocal')
            ? 'http://localhost:8765'
            : undefined,
        });
      },
      inject: [ConfigService],
    },
    {
      provide: AbstractMatchOutcomeService,
      useFactory: (
        configService: ConfigService,
        dynamoDbClient: DynamoDBClient,
      ) => {
        const useMockMatchOutcomeService = configService.get<boolean>(
          'useMockMatchOutcomeService',
        );
        return useMockMatchOutcomeService
          ? new MockMatchOutcomeService(configService, dynamoDbClient)
          : new MatchOutcomeService(configService, dynamoDbClient);
      },
      inject: [ConfigService, DynamoDBClient],
    },
    MatchPersistenceService,
    MatchManagementService,
    MatchPersistenceService,
    MatchBettingService,
  ],
  exports: [
    MatchManagementService,
    MatchPersistenceService,
    MatchBettingService,
  ],
})
export class MatchModule {}
