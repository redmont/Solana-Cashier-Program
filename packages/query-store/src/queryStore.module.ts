import { DynamicModule, Global, Module } from '@nestjs/common';
import {
  ConfigurableModuleClass,
  QUERY_STORE_MODULE_ASYNC_OPTIONS_TYPE,
  QUERY_STORE_MODULE_OPTIONS_TOKEN,
  QUERY_STORE_MODULE_OPTIONS_TYPE,
} from './queryStore.module-definition';
import {
  ActivityStreamSchema,
  CurrentMatchSchema,
  DailyClaimAmountsSchema,
  DailyClaimStatusSchema,
  MatchSchema,
  RosterSchema,
  SeriesSchema,
  TournamentEntrySchema,
  TournamentSchema,
  UserMatchResultSchema,
  UserMatchSchema,
} from './schemas';
import { DynamooseModule, Model } from 'nestjs-dynamoose';
import { QueryStoreService } from './queryStore.service';
import { RedisCacheModule, RedisCacheService } from 'global-cache';
import { TournamentQueryStoreService } from './tournamentQueryStore.service';
import { UserProfilesQueryStoreService } from './userProfiles.service';
import { UserProfileSchema } from './schemas/userProfile.schema';
import { Key } from './interfaces/key.interface';
import { UserProfile } from './interfaces/userProfile.interface';
import { Tournament, TournamentEntry } from './interfaces';

@Module({})
export class QueryStoreOptionsModule extends ConfigurableModuleClass {
  public static registerAsync(
    options: typeof QUERY_STORE_MODULE_ASYNC_OPTIONS_TYPE,
  ): DynamicModule {
    return {
      ...super.registerAsync(options),
      exports: [QUERY_STORE_MODULE_OPTIONS_TOKEN],
    };
  }
}

@Global()
@Module({
  providers: [QueryStoreService],
  exports: [
    QueryStoreService,
    RedisCacheModule,
    UserProfilesQueryStoreService,
    TournamentQueryStoreService,
  ],
})
export class QueryStoreModule extends ConfigurableModuleClass {
  static registerAsync(
    options: typeof QUERY_STORE_MODULE_ASYNC_OPTIONS_TYPE,
  ): DynamicModule {
    const schemas = {
      match: MatchSchema,
      series: SeriesSchema,
      currentMatch: CurrentMatchSchema,
      activityStream: ActivityStreamSchema,
      userMatch: UserMatchSchema,
      userMatchResult: UserMatchResultSchema,
      roster: RosterSchema,
      tournament: TournamentSchema,
      tournamentEntry: TournamentEntrySchema,
      dailyClaimAmounts: DailyClaimAmountsSchema,
      dailyClaimStatus: DailyClaimStatusSchema,
      userProfile: UserProfileSchema,
    };

    const moduleDefinition = super.registerAsync(options);

    return {
      ...moduleDefinition,
      imports: [
        ...(moduleDefinition.imports || []),
        DynamooseModule.forFeatureAsync(
          Object.keys(schemas).map((key) => {
            return {
              name: key,
              imports: [QueryStoreOptionsModule.registerAsync(options)],
              useFactory: async (
                _: any,
                options: typeof QUERY_STORE_MODULE_OPTIONS_TYPE,
              ) => {
                return {
                  schema: schemas[key],
                  options: {
                    tableName: options.tableName,
                    create: options.isDynamoDbLocal,
                  },
                };
              },
              inject: [QUERY_STORE_MODULE_OPTIONS_TOKEN],
            };
          }),
        ),
        RedisCacheModule.registerAsync({
          imports: [QueryStoreOptionsModule.registerAsync(options)],
          useFactory: async (
            options: typeof QUERY_STORE_MODULE_OPTIONS_TYPE,
          ) => {
            return {
              redisHost: options.redisHost,
              redisPort: options.redisPort,
            };
          },
          inject: [QUERY_STORE_MODULE_OPTIONS_TOKEN],
        }),
      ],
      providers: [
        ...(moduleDefinition.providers || []),
        {
          provide: UserProfilesQueryStoreService,
          inject: [RedisCacheService, 'userProfileModel'],
          useFactory: async (
            cache: RedisCacheService,
            userProfileModel: Model<UserProfile, Key>,
          ) => {
            return new UserProfilesQueryStoreService(cache, userProfileModel);
          },
        },
        {
          provide: TournamentQueryStoreService,
          inject: [
            RedisCacheService,
            UserProfilesQueryStoreService,
            'tournamentModel',
            'tournamentEntryModel',
          ],
          useFactory: async (
            cache: RedisCacheService,
            userProfilesQueryStoreService: UserProfilesQueryStoreService,
            tournamentModel: Model<Tournament, Key>,
            tournamentEntryModel: Model<TournamentEntry, Key>,
          ) => {
            return new TournamentQueryStoreService(
              cache,
              userProfilesQueryStoreService,
              tournamentModel,
              tournamentEntryModel,
            );
          },
        },
      ],
    };
  }
}
