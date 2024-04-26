import { Module } from '@nestjs/common';
import { GlobalClientsModule } from '../global-clients-module';
import { MatchPersistenceService } from './match-persistence.service';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigService } from '@nestjs/config';
import { MatchSchema } from './schemas/match.schema';
import { GameServerModule } from 'src/game-server/game-server.module';
import { BetSchema } from './schemas/bet.schema';
import { MatchManagementService } from './match-management.service';
import { MatchBettingService } from './match-betting.service';

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
