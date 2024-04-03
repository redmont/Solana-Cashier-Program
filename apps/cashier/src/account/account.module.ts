import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { config } from "src/config";
import { QueryModelBusService } from "./query-model-bus.service";
import { QueryModelBusAdapter } from "./query-model-bus-adapter.service";
import { ReadModelModule } from "src/account/read-model/read-model.module";
import { AccountController } from "./account.controller";
import { EventStoreService } from "./event-store.service";
import { ConnectedEventStore } from "@castore/core";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "MATCH_MANAGER_REDIS",
        transport: Transport.REDIS,
        options: {
          host: config.redisHost,
          port: parseInt(config.redisPort),
        },
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
        modelBusService: QueryModelBusService
      ) =>
        new ConnectedEventStore(
          eventStoreService.accountsEventStore,
          modelBusService.queryModelBus
        ),
      inject: [EventStoreService, QueryModelBusService],
    },
  ],
  controllers: [AccountController],
})
export class AccountModule {}
