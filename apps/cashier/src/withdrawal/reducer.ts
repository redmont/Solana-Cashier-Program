import type { Reducer, EventDetail } from '@castore/core';
import { WithdrawalAggregate } from './aggregate';

export interface WithdrawalEventDetails extends EventDetail {}

export const withdrawalReducer: Reducer<
  WithdrawalAggregate,
  WithdrawalEventDetails
> = (withdrawalAggregate, newEvent) => {
  const { version, aggregateId } = newEvent;

  switch (newEvent.type) {
    case 'WITHDRAWAL_CREATED': {
      const {
        receiptId,
        accountId,
        createdAt,
        chainId,
        tokenSymbol,
        tokenAddress,
        tokenDecimals,
        tokenAmount,
        signature,
        creditAmount,
        validFrom,
        validTo,
        status,
      } = newEvent.payload;

      return {
        aggregateId,
        version,
        receiptId,
        accountId,
        createdAt,
        chainId,
        tokenSymbol,
        tokenAddress,
        tokenDecimals,
        tokenAmount,
        signature,
        creditAmount,
        validFrom,
        validTo,
        status,
      };
    }

    case 'WITHDRAWAL_COMPLETED_CONFIRMED':
    case 'WITHDRAWAL_COMPLETED_UNCONFIRMED': {
      const { status, transactionHash } = newEvent.payload;

      return {
        ...withdrawalAggregate,
        version,
        status,
        transactionHash,
      };
    }
  }

  throw new Error(`Unknown event type: ${newEvent.type}`);
};
