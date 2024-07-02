import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { TournamentSchema } from './schemas/tournament.schema';
import { TournamentEntrySchema } from './schemas/tournamentEntry.schema';
import { TournamentService } from './tournament.service';
import { TournamentController } from './tournament.controller';
import { TournamentWinningsSchema } from './schemas/tournamentWinnings.schema';

@Module({
  imports: [
    DynamooseModule.forFeatureAsync([
      {
        name: 'tournament',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: TournamentSchema,
            options: {
              tableName: configService.get<string>('tableName'),
              create: configService.get<boolean>('isDynamoDbLocal'),
            },
          };
        },
        inject: [ConfigService],
      },
      {
        name: 'tournamentEntry',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: TournamentEntrySchema,
            options: {
              tableName: configService.get<string>('tableName'),
              create: configService.get<boolean>('isDynamoDbLocal'),
            },
          };
        },
        inject: [ConfigService],
      },
      {
        name: 'tournamentWinnings',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: TournamentWinningsSchema,
            options: {
              tableName: configService.get<string>('tableName'),
              create: configService.get<boolean>('isDynamoDbLocal'),
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [TournamentService],
  controllers: [TournamentController],
  exports: [TournamentService],
})
export class TournamentModule {}
