import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { ConnectedEventStore } from '@castore/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReadModelModule } from 'cashier-read-model';
import { AccountQueryModelBusService } from './queryModelBus.service';
import { AccountQueryModelBusAdapter } from './queryModelBusAdapter.service';
import { AccountsEventStoreService } from './eventStore.service';

@Module({
  imports: [
    ReadModelModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          tableName: configService.get<string>('readModelTableName'),
          redisHost: configService.get<string>('redisHost'),
          redisPort: parseInt(configService.get<string>('redisPort')),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    AccountQueryModelBusService,
    AccountQueryModelBusAdapter,
    AccountsEventStoreService,
    {
      provide: 'AccountsConnectedEventStore',
      useFactory: (
        eventStoreService: AccountsEventStoreService,
        modelBusService: AccountQueryModelBusService,
      ) =>
        new ConnectedEventStore(
          eventStoreService.eventStore,
          modelBusService.queryModelBus,
        ),
      inject: [AccountsEventStoreService, AccountQueryModelBusService],
    },
  ],
  controllers: [AccountController],
  exports: ['AccountsConnectedEventStore'],
})
export class AccountModule {}
