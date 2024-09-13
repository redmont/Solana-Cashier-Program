import { EventStore } from '@castore/core';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBSingleTableEventStorageAdapter } from '@castore/event-storage-adapter-dynamodb';
import {
  withdrawalCreatedEventType,
  withdrawalCompletedUnconfirmedEventType,
  withdrawalCompletedConfirmedEventType,
} from './eventTypes';
import { Injectable } from '@nestjs/common';
import { withdrawalReducer } from './reducer';

@Injectable()
export class WithdrawalEventStoreService {
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
      eventStoreId: 'WITHDRAWALS',
      eventTypes: [
        withdrawalCreatedEventType,
        withdrawalCompletedUnconfirmedEventType,
        withdrawalCompletedConfirmedEventType,
      ],
      reducer: withdrawalReducer,
      eventStorageAdapter: eventStorageAdapter,
    });
  }
}
