import { EventStore } from '@castore/core';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBSingleTableEventStorageAdapter } from '@castore/event-storage-adapter-dynamodb';
import {
  accountCreatedEventType,
  creditEventType,
  debitEventType,
} from './eventTypes';
import { Injectable } from '@nestjs/common';
import { accountsReducer } from './reducer';

@Injectable()
export class AccountsEventStoreService {
  public eventStore: any;

  constructor(configService: ConfigService) {
    const dynamoDBClient = new DynamoDBClient({
      endpoint: configService.get<boolean>('isDynamoDbLocal')
        ? 'http://localhost:8765'
        : undefined,
    });

    const eventStorageAdapter = new DynamoDBSingleTableEventStorageAdapter({
      tableName: () => configService.get<string>('eventsTableName'),
      dynamoDBClient,
    });

    this.eventStore = new EventStore({
      eventStoreId: 'ACCOUNTS',
      eventTypes: [accountCreatedEventType, creditEventType, debitEventType],
      reducer: accountsReducer,
      eventStorageAdapter: eventStorageAdapter,
    });
  }
}
