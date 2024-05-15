import {
  Module,
  DynamicModule,
  Global,
  ModuleMetadata,
  Provider,
  Type,
} from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { MatchSchema } from './schemas/match.schema';
import { QueryStoreService } from '.';
import { SeriesSchema } from './schemas/series.schema';
import { ActivityStreamSchema } from './schemas/activityStream.schema';
import { CurrentMatchSchema } from './schemas/currentMatch.schema';
import { UserMatchResultSchema } from './schemas/userMatchResult.schema';
import { RosterSchema } from './schemas/roster.schema';
import { UserMatchSchema } from './schemas/userMatch.schema';

interface QueryStoreOptions {
  local?: string | boolean;
  tableName: string;
  isDynamoDbLocal: boolean;
}

export interface QueryStoreModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<QueryStoreOptionsFactory>;
  useClass?: Type<QueryStoreOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<QueryStoreOptions> | QueryStoreOptions;
  inject?: any[];
  extraProviders?: Provider[];
}

export interface QueryStoreOptionsFactory {
  createQueryStoreOptions(): Promise<QueryStoreOptions> | QueryStoreOptions;
}

@Global()
@Module({})
export class QueryStoreModule {
  static registerAsync(options: QueryStoreModuleAsyncOptions): DynamicModule {
    const models = [
      {
        name: 'match',
        imports: options.imports || [],
        useFactory: async (_: any, options: QueryStoreOptions) => {
          return {
            schema: MatchSchema,
            options: {
              tableName: options.tableName,
              create: options.isDynamoDbLocal,
            },
          };
        },
        inject: ['QUERY_STORE_OPTIONS'],
      },
      {
        name: 'series',
        imports: options.imports || [],
        useFactory: async (_: any, options: QueryStoreOptions) => {
          return {
            schema: SeriesSchema,
            options: {
              tableName: options.tableName,
              create: options.isDynamoDbLocal,
            },
          };
        },
        inject: ['QUERY_STORE_OPTIONS'],
      },
      {
        name: 'currentMatch',
        imports: options.imports || [],
        useFactory: async (_: any, options: QueryStoreOptions) => {
          return {
            schema: CurrentMatchSchema,
            options: {
              tableName: options.tableName,
              create: options.isDynamoDbLocal,
            },
          };
        },
        inject: ['QUERY_STORE_OPTIONS'],
      },
      {
        name: 'activityStream',
        imports: options.imports || [],
        useFactory: async (_: any, options: QueryStoreOptions) => {
          return {
            schema: ActivityStreamSchema,
            options: {
              tableName: options.tableName,
              create: options.isDynamoDbLocal,
            },
          };
        },
        inject: ['QUERY_STORE_OPTIONS'],
      },
      {
        name: 'userMatch',
        imports: options.imports || [],
        useFactory: async (_: any, options: QueryStoreOptions) => {
          return {
            schema: UserMatchSchema,
            options: {
              tableName: options.tableName,
              create: options.isDynamoDbLocal,
            },
          };
        },
        inject: ['QUERY_STORE_OPTIONS'],
      },
      {
        name: 'userMatchResult',
        imports: options.imports || [],
        useFactory: async (_: any, options: QueryStoreOptions) => {
          return {
            schema: UserMatchResultSchema,
            options: {
              tableName: options.tableName,
              create: options.isDynamoDbLocal,
            },
          };
        },
        inject: ['QUERY_STORE_OPTIONS'],
      },
      {
        name: 'roster',
        imports: options.imports || [],
        useFactory: async (_: any, options: QueryStoreOptions) => {
          return {
            schema: RosterSchema,
            options: {
              tableName: options.tableName,
              create: options.isDynamoDbLocal,
            },
          };
        },
        inject: ['QUERY_STORE_OPTIONS'],
      },
    ];

    return {
      module: QueryStoreModule,
      imports: [
        DynamooseModule.forRootAsync({
          useFactory: async (options: QueryStoreOptions) => {
            return {
              local: options.local,
            };
          },
          inject: ['QUERY_STORE_OPTIONS'],
        }),
        DynamooseModule.forFeatureAsync(models),
        ...(options.imports || []),
      ],
      providers: [...this.createAsyncProviders(options), QueryStoreService],
      exports: [QueryStoreService, 'QUERY_STORE_OPTIONS'],
    };
  }

  private static createAsyncProviders(
    options: QueryStoreModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    // For useClass
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: QueryStoreModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: 'QUERY_STORE_OPTIONS',
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    // For useClass or useExisting
    return {
      provide: 'QUERY_STORE_OPTIONS',
      useFactory: async (optionsFactory: QueryStoreOptionsFactory) =>
        optionsFactory.createQueryStoreOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
