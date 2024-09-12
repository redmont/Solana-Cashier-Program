import { StateCarryingMessageBus } from '@castore/core';
import { Injectable } from '@nestjs/common';
import { WithdrawalQueryModelBusAdapter } from './queryModelBusAdapter.service';
import { WithdrawalEventStoreService } from './eventStore.service';

@Injectable()
export class WithdrawalQueryModelBusService {
  public readonly queryModelBus: StateCarryingMessageBus;

  constructor(
    queryModelBusAdapter: WithdrawalQueryModelBusAdapter,
    eventStore: WithdrawalEventStoreService,
  ) {
    this.queryModelBus = new StateCarryingMessageBus({
      messageBusId: 'QUERY_MODEL_BUS',
      sourceEventStores: [eventStore.eventStore],
      messageBusAdapter: queryModelBusAdapter,
    });
  }
}
