import type { Reducer, EventDetail } from '@castore/core';
import { AccountAggregate } from '../aggregates';

export interface AccountEventDetails extends EventDetail {}

export const accountsReducer: Reducer<AccountAggregate, AccountEventDetails> = (
  accountAggregate,
  newEvent,
) => {
  const { version, aggregateId } = newEvent;

  switch (newEvent.type) {
    case 'ACCOUNT_CREATED': {
      const { accountId, primaryWalletAddress } = newEvent.payload;

      return {
        aggregateId,
        version,
        accountId,
        primaryWalletAddress,
        balance: 0,
      };
    }
    case 'ACCOUNT_CREDITED': {
      return {
        ...accountAggregate,
        version,
        balance: accountAggregate.balance + newEvent.payload.amount,
      };
    }

    case 'ACCOUNT_DEBITED': {
      return {
        ...accountAggregate,
        version,
        balance: accountAggregate.balance - newEvent.payload.amount,
      };
    }
  }

  throw new Error(`Unknown event type: ${newEvent.type}`);
};
