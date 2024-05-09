import {
  DynamicModule,
  Global,
  Module,
  ModuleMetadata,
  OnModuleInit,
  Provider,
  Type,
} from '@nestjs/common';
import { DynamooseModule, InjectModel, Model } from 'nestjs-dynamoose';
import { ReadModelService } from './readModel.service';
import { AccountSchema } from './schemas/account.schema';
import { AccountCount } from './interfaces/accountCount.interface';
import { ReadModelKey } from './interfaces/key.interface';
import { AccountCountSchema } from './schemas/accountCount.schema';

interface ReadModelOptions {
  tableName: string;
}

export interface ReadModelModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<ReadModelOptionsFactory>;
  useClass?: Type<ReadModelOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<ReadModelOptions> | ReadModelOptions;
  inject?: any[];
  extraProviders?: Provider[];
}

export interface ReadModelOptionsFactory {
  createReadModelOptions(): Promise<ReadModelOptions> | ReadModelOptions;
}

@Global()
@Module({})
export class ReadModelModule implements OnModuleInit {
  constructor(
    @InjectModel('accountCount')
    private readonly accountCountModel: Model<AccountCount, ReadModelKey>,
  ) {}

  static registerAsync(options: ReadModelModuleAsyncOptions): DynamicModule {
    const models = [
      {
        name: 'account',
        imports: options.imports || [],
        useFactory: (_: any, options: ReadModelOptions) => {
          return {
            schema: AccountSchema,
            options: {
              tableName: options.tableName,
            },
          };
        },
        inject: ['READ_MODEL_OPTIONS'],
      },
      {
        name: 'accountCount',
        imports: options.imports || [],
        useFactory: (_: any, options: ReadModelOptions) => {
          return {
            schema: AccountCountSchema,
            options: {
              tableName: options.tableName,
            },
          };
        },
        inject: ['READ_MODEL_OPTIONS'],
      },
    ];

    return {
      module: ReadModelModule,
      imports: [
        DynamooseModule.forFeatureAsync(models),
        ...(options.imports || []),
      ],
      providers: [...this.createAsyncProviders(options), ReadModelService],
      exports: [ReadModelService, 'READ_MODEL_OPTIONS'],
    };
  }

  async onModuleInit() {
    // Ensure there is an accountCount item
    const key = {
      pk: 'accountCount',
      sk: 'accountCount',
    };

    const accountCount = await this.accountCountModel.get(key);

    if (!accountCount) {
      await this.accountCountModel.create({
        ...key,
        count: 0,
      });
    }
  }
  private static createAsyncProviders(
    options: ReadModelModuleAsyncOptions,
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
    options: ReadModelModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: 'READ_MODEL_OPTIONS',
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    // For useClass or useExisting
    return {
      provide: 'READ_MODEL_OPTIONS',
      useFactory: async (optionsFactory: ReadModelOptionsFactory) =>
        optionsFactory.createReadModelOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
