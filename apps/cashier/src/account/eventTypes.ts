import { EventType } from '@castore/core';

export const accountCreatedEventType = new EventType<'ACCOUNT_CREATED', {}>({
  type: 'ACCOUNT_CREATED',
});

export const creditEventType = new EventType<
  'ACCOUNT_CREDITED',
  {
    accountId: string;
    amount: number;
    reason: string;
    transactionHash?: string;
  }
>({ type: 'ACCOUNT_CREDITED' });

export const debitEventType = new EventType<
  'ACCOUNT_DEBITED',
  { accountId: string; amount: number }
>({ type: 'ACCOUNT_DEBITED' });

export const withdrawalCreatedEventType = new EventType<
  'ACCOUNT_WITHDRAWAL_CREATED',
  { accountId: string; receiptId: string; amount: number }
>({ type: 'ACCOUNT_WITHDRAWAL_CREATED' });
