import { SeriesModule } from '@/series/series.module';
import { Module } from '@nestjs/common';
import { RosterService } from './roster.service';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigService } from '@nestjs/config';
import { RosterSchema } from './roster.schema';
import { FighterProfilesModule } from '@/fighterProfiles/fighterProfiles.module';

@Module({
  imports: [
    DynamooseModule.forFeatureAsync([
      {
        name: 'roster',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: RosterSchema,
            options: {
              tableName: configService.get<string>('tableName'),
              create: configService.get<boolean>('isDynamoDbLocal'),
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
    SeriesModule,
    FighterProfilesModule,
  ],
  providers: [RosterService],
  exports: [RosterService],
})
export class RosterModule {}
