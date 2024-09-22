import type { Reducer, EventDetail } from '@castore/core';
import { AccountAggregate } from './aggregate';

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
        vipBalance: 0,
      };
    }

    case 'ACCOUNT_CREDITED': {
      const { amount, vip } = newEvent.payload;

      const balance = accountAggregate.balance + (!vip ? amount : 0);
      const vipBalance = accountAggregate.vipBalance + (vip ? amount : 0);

      return {
        ...accountAggregate,
        version,
        balance,
        vipBalance,
      };
    }

    case 'ACCOUNT_DEBITED': {
      const { amount, vip } = newEvent.payload;

      const balance = accountAggregate.balance - (!vip ? amount : 0);
      const vipBalance = accountAggregate.vipBalance - (vip ? amount : 0);

      return {
        ...accountAggregate,
        version,
        balance,
        vipBalance,
      };
    }

    case 'ACCOUNT_WITHDRAWAL_CREATED': {
      console.log(
        'Withdrawal created event, balance will be',
        accountAggregate.balance - newEvent.payload.amount,
      );
      return {
        ...accountAggregate,
        version,
        balance: accountAggregate.balance - newEvent.payload.amount,
      };
    }
  }

  throw new Error(`Unknown event type: ${newEvent.type}`);
};
