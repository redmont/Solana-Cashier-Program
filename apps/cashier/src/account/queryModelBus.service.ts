import { StateCarryingMessageBus } from '@castore/core';
import { Injectable } from '@nestjs/common';
import { AccountQueryModelBusAdapter } from './queryModelBusAdapter.service';
import { AccountsEventStoreService } from './eventStore.service';

@Injectable()
export class AccountQueryModelBusService {
  public readonly queryModelBus: StateCarryingMessageBus;

  constructor(
    queryModelBusAdapter: AccountQueryModelBusAdapter,
    eventStore: AccountsEventStoreService,
  ) {
    this.queryModelBus = new StateCarryingMessageBus({
      messageBusId: 'QUERY_MODEL_BUS',
      sourceEventStores: [eventStore.eventStore],
      messageBusAdapter: queryModelBusAdapter,
    });
  }
}
