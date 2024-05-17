import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QueryModelBusService } from './queryModelBus.service';
import { QueryModelBusAdapter } from './queryModelBusAdapter.service';
import { AccountController } from './account.controller';
import { EventStoreService } from './eventStore.service';
import { ConnectedEventStore } from '@castore/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReadModelModule } from 'cashier-read-model';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'BROKER',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
          return {
            transport: Transport.NATS,
            options: {
              servers: [configService.get<string>('natsUri')],
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
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
})
export class AccountModule {}
