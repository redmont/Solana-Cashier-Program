import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QueryModelBusService } from './query-model-bus.service';
import { QueryModelBusAdapter } from './query-model-bus-adapter.service';
import { ReadModelModule } from 'src/account/read-model/read-model.module';
import { AccountController } from './account.controller';
import { EventStoreService } from './event-store.service';
import { ConnectedEventStore } from '@castore/core';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
    ReadModelModule,
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
