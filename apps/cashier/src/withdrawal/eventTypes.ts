import { EventType } from '@castore/core';

export const withdrawalCreatedEventType = new EventType<
  'WITHDRAWAL_CREATED',
  {
    receiptId: string;
    accountId: string;
    createdAt: string;
    chainId: string;
    tokenAddress?: string;
    tokenDecimals: number;
    tokenAmount: string;
    signature: string;
    creditAmount: number;
    validFrom: string;
    validTo: string;
  }
>({ type: 'WITHDRAWAL_CREATED' });

export const withdrawalCompletedUnconfirmedEventType = new EventType<
  'WITHDRAWAL_COMPLETED_UNCONFIRMED',
  {
    accountId: string;
    receiptId: string;
    transactionHash: string;
  }
>({ type: 'WITHDRAWAL_COMPLETED_UNCONFIRMED' });

export const withdrawalCompletedConfirmedEventType = new EventType<
  'WITHDRAWAL_COMPLETED_CONFIRMED',
  {
    accountId: string;
    receiptId: string;
    transactionHash: string;
  }
>({ type: 'WITHDRAWAL_COMPLETED_CONFIRMED' });
