import { Module } from '@nestjs/common';
import { ConnectedEventStore } from '@castore/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReadModelModule } from 'cashier-read-model';
import { WithdrawalQueryModelBusAdapter } from './queryModelBusAdapter.service';
import { WithdrawalEventStoreService } from './eventStore.service';
import { WithdrawalQueryModelBusService } from './queryModelBus.service';
import { WithdrawalController } from './withdrawal.controller';
import { AccountModule } from '@/account/account.module';

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
    AccountModule,
  ],
  providers: [
    WithdrawalQueryModelBusService,
    WithdrawalQueryModelBusAdapter,
    WithdrawalEventStoreService,
    {
      provide: 'WithdrawalsConnectedEventStore',
      useFactory: (
        eventStoreService: WithdrawalEventStoreService,
        modelBusService: WithdrawalQueryModelBusService,
      ) =>
        new ConnectedEventStore(
          eventStoreService.eventStore,
          modelBusService.queryModelBus,
        ),
      inject: [WithdrawalEventStoreService, WithdrawalQueryModelBusService],
    },
  ],
  controllers: [WithdrawalController],
  exports: ['WithdrawalsConnectedEventStore'],
})
export class WithdrawalModule {}
