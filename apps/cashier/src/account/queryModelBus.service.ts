import { StateCarryingMessageBus } from '@castore/core';
import { Injectable } from '@nestjs/common';
import { QueryModelBusAdapter } from './queryModelBusAdapter.service';
import { EventStoreService } from './eventStore.service';

@Injectable()
export class QueryModelBusService {
  public readonly queryModelBus: StateCarryingMessageBus;

  constructor(
    queryModelBusAdapter: QueryModelBusAdapter,
    eventStore: EventStoreService,
  ) {
    this.queryModelBus = new StateCarryingMessageBus({
      messageBusId: 'QUERY_MODEL_BUS',
      sourceEventStores: [eventStore.accountsEventStore],
      messageBusAdapter: queryModelBusAdapter,
    });
  }
}
