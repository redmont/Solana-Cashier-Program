import { EventStore } from "@castore/core";
import { ConfigService } from "@nestjs/config";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBSingleTableEventStorageAdapter } from "@castore/event-storage-adapter-dynamodb";
import {
  accountCreatedEventType,
  creditEventType,
  debitEventType,
} from "./event-types";
import { accountsReducer } from "./reducers/accounts-reducer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EventStoreService {
  public accountsEventStore: any;

  constructor(configService: ConfigService) {
    const dynamoDBClient = new DynamoDBClient({
      endpoint: configService.get<boolean>("IS_DDB_LOCAL")
        ? "http://localhost:8765"
        : undefined,
    });

    const eventStorageAdapter = new DynamoDBSingleTableEventStorageAdapter({
      tableName: () => "cashier-events",
      dynamoDBClient,
    });

    this.accountsEventStore = new EventStore({
      eventStoreId: "ACCOUNTS",
      eventTypes: [accountCreatedEventType, creditEventType, debitEventType],
      reducer: accountsReducer,
      eventStorageAdapter: eventStorageAdapter,
    });
  }
}
