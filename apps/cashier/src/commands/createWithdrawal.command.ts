import { Command, EventStore, tuple } from '@castore/core';

type Input = {
  receiptId: string;
  accountId: string;
  chainId: string;
  tokenSymbol?: string;
  tokenAddress?: string;
  tokenDecimals: number;
  tokenAmount: string;
  signature: string;
  creditAmount: number;
  createdAt: string;
  validFrom: string;
  validTo: string;
};

type Output = { receiptId: string };
type Context = {};

export const createWithdrawalCommand = (
  accountsEventStore: EventStore,
  withdrawalEventStore: EventStore,
): Command<'CREATE_WITHDRAWAL', any, any, any, any, any[]> =>
  new Command({
    commandId: 'CREATE_WITHDRAWAL',
    requiredEventStores: tuple(accountsEventStore, withdrawalEventStore),
    handler: async (
      commandInput: Input,
      [accountsEventStore, withdrawalEventStore],
      {}: Context,
    ): Promise<Output> => {
      const {
        receiptId,
        accountId,
        creditAmount,
        chainId,
        tokenAmount,
        tokenSymbol,
        tokenDecimals,
        validFrom,
        validTo,
        signature,
      } = commandInput;

      const { aggregate: accountAggregate } =
        await accountsEventStore.getAggregate(accountId);

      if (accountAggregate === undefined) {
        throw new Error(`Account with id ${accountId} does not exist`);
      }

      // Check if the account has enough balance
      if (accountAggregate.balance < creditAmount) {
        throw new Error('Insufficient balance');
      }

      const accountWithdrawalCreatedEvent = accountsEventStore.groupEvent({
        aggregateId: accountId,
        version: accountAggregate.version + 1,
        type: 'ACCOUNT_WITHDRAWAL_CREATED',
        payload: {
          receiptId,
          amount: creditAmount,
        },
      });
      accountWithdrawalCreatedEvent.eventStore = accountsEventStore;

      const withdrawalEvent = withdrawalEventStore.groupEvent({
        aggregateId: receiptId,
        version: 1,
        type: 'WITHDRAWAL_CREATED',
        payload: {
          receiptId,
          accountId,
          creditAmount,
          chainId,
          tokenAmount,
          tokenSymbol,
          tokenDecimals,
          validFrom,
          validTo,
          signature,
          status: 'PENDING',
        },
      });
      withdrawalEvent.eventStore = withdrawalEventStore;

      await EventStore.pushEventGroup(
        accountWithdrawalCreatedEvent,
        withdrawalEvent,
      );

      return { receiptId };
    },
  });
