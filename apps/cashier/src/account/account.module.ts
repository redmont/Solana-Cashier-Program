import { Module } from '@nestjs/common';
import { QueryModelBusService } from './queryModelBus.service';
import { QueryModelBusAdapter } from './queryModelBusAdapter.service';
import { AccountController } from './account.controller';
import { EventStoreService } from './eventStore.service';
import { ConnectedEventStore } from '@castore/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReadModelModule } from 'cashier-read-model';
import { NatsJetStreamTransport } from '@nestjs-plugins/nestjs-nats-jetstream-transport';

@Module({
  imports: [
    NatsJetStreamTransport.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          connectionOptions: {
            servers: [configService.get<string>('natsUri')],
          },
        };
      },
      inject: [ConfigService],
    }),
    ReadModelModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          tableName: configService.get<string>('readModelTableName'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    QueryModelBusService,
    QueryModelBusAdapter,
    EventStoreService,
    {
      provide: ConnectedEventStore,
      useFactory: (
        eventStoreService: EventStoreService,
        modelBusService: QueryModelBusService,
      ) =>
        new ConnectedEventStore(
          eventStoreService.accountsEventStore,
          modelBusService.queryModelBus,
        ),
      inject: [EventStoreService, QueryModelBusService],
    },
  ],
  controllers: [AccountController],
  exports: [ConnectedEventStore],
})
export class AccountModule {}
