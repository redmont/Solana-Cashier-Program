import { Module } from '@nestjs/common';
import { FighterProfilesService } from './fighterProfiles.service';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigService } from '@nestjs/config';
import { FighterProfileSchema } from './fighterProfile.schema';
import { FighterProfilesPersistenceService } from './fighterProfilesPersistence.service';

@Module({
  imports: [
    DynamooseModule.forFeatureAsync([
      {
        name: 'fighterProfile',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: FighterProfileSchema,
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
  providers: [FighterProfilesPersistenceService, FighterProfilesService],
  exports: [FighterProfilesService],
})
export class FighterProfilesModule {}
