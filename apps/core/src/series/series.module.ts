import { Module } from '@nestjs/common';
import { SeriesService } from './series.service';
import { SeriesController } from './series.controller';
import { SeriesPersistenceService } from './series-persistence.service';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigService } from '@nestjs/config';
import { SeriesSchema } from './series.schema';
import { MatchModule } from 'src/match/match.module';
import { GatewayManagerModule } from 'src/gateway-manager/gateway-manager.module';

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
  ],
  providers: [SeriesService, SeriesPersistenceService],
  controllers: [SeriesController],
  exports: [SeriesService],
})
export class SeriesModule {}
