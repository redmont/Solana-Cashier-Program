import { Command, EventStore, tuple } from '@castore/core';

type Input = { accountId: string; reason: string };
type Output = { accountId: string };
type Context = {};

export const resetAccountBalanceCommand = (eventStore: EventStore) =>
  new Command({
    commandId: 'RESET_ACCOUNT_BALANCE',
    requiredEventStores: tuple(eventStore),
    handler: async (
      commandInput: Input,
      [eventStore],
      {}: Context,
    ): Promise<Output> => {
      const { accountId, reason } = commandInput;

      const { aggregate: accountAggregate } =
        await eventStore.getAggregate(accountId);

      if (accountAggregate === undefined) {
        throw new Error(`Account with id ${accountId} does not exist`);
      }

      const { version: accountVersion } = accountAggregate;

      const balance = Math.floor((accountAggregate as any).balance);

      if (balance > 100) {
        const amount = balance - 100;

        await eventStore.pushEvent(
          {
            aggregateId: accountId,
            version: accountVersion + 1,
            type: 'ACCOUNT_DEBITED',
            payload: { accountId, amount, reason },
          },
          {
            prevAggregate: accountAggregate,
          },
        );
      } else if (balance < 100) {
        const amount = 100 - balance;

        await eventStore.pushEvent(
          {
            aggregateId: accountId,
            version: accountVersion + 1,
            type: 'ACCOUNT_CREDITED',
            payload: { accountId, amount, reason },
          },
          {
            prevAggregate: accountAggregate,
          },
        );
      }

      return { accountId };
    },
  });
