import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigService } from '@nestjs/config';
import { SeriesService } from './series.service';
import { SeriesController } from './series.controller';
import { SeriesPersistenceService } from './seriesPersistence.service';
import { SeriesSchema } from './series.schema';
import { MatchModule } from 'src/match/match.module';
import { GatewayManagerModule } from '@/gatewayManager/gatewayManager.module';
import { FighterProfilesModule } from '@/fighterProfiles/fighterProfiles.module';
import { TournamentModule } from '@/tournament/tournament.module';

@Module({
  imports: [
    DynamooseModule.forFeatureAsync([
      {
        name: 'series',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: SeriesSchema,
            options: {
              tableName: configService.get<string>('tableName'),
              create: configService.get<boolean>('isDynamoDbLocal'),
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
    MatchModule,
    GatewayManagerModule,
    FighterProfilesModule,
    TournamentModule,
  ],
  providers: [SeriesService, SeriesPersistenceService],
  controllers: [SeriesController],
  exports: [SeriesService],
})
export class SeriesModule {}
