import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigService } from '@nestjs/config';
import { GlobalClientsModule } from '../globalClientsModule';
import { MatchPersistenceService } from './matchPersistence.service';
import { MatchSchema } from './schemas/match.schema';
import { GameServerModule } from '@/gameServer/gameServer.module';
import { BetSchema } from './schemas/bet.schema';
import { MatchManagementService } from './matchManagement.service';
import { MatchBettingService } from './matchBetting.service';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { MockMatchOutcomeService } from './matchOutcome/mockMatchOutcome.service';
import { MatchOutcomeService } from './matchOutcome/matchOutcome.service';
import { AbstractMatchOutcomeService } from './matchOutcome/abstractMatchOutcomeService';
import { UserMatchResultSchema } from './schemas/userMatchResult.schema';
import { GatewayManagerModule } from '@/gatewayManager/gatewayManager.module';

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
      {
        name: 'userMatchResult',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: UserMatchResultSchema,
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
    GatewayManagerModule,
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
