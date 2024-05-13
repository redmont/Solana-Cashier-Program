import { Command, EventStore, tuple } from '@castore/core';

type Input = { accountId: string; amount: number };
type Output = { accountId: string };
type Context = {};

export class InsufficientBalanceError extends Error {}

export const debitAccountCommand = (eventStore: EventStore) =>
  new Command({
    commandId: 'DEBIT_ACCOUNT',
    requiredEventStores: tuple(eventStore),
    handler: async (
      commandInput: Input,
      [eventStore],
      {}: Context,
    ): Promise<Output> => {
      const { accountId, amount } = commandInput;

      const { aggregate: accountAggregate } =
        await eventStore.getAggregate(accountId);

      if (accountAggregate === undefined) {
        throw new Error(`Account with id ${accountId} does not exist`);
      }

      const { version: accountVersion } = accountAggregate;

      // Check if the account has enough balance
      if ((accountAggregate as any).balance < amount) {
        throw new InsufficientBalanceError(
          `Account with id ${accountId} does not have enough balance`,
        );
      }

      await eventStore.pushEvent(
        {
          aggregateId: accountId,
          version: accountVersion + 1,
          type: 'ACCOUNT_DEBITED',
          payload: { accountId, amount },
        },
        {
          prevAggregate: accountAggregate,
        },
      );

      return { accountId };
    },
  });
