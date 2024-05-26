import { Command, EventStore, tuple } from '@castore/core';

type Input = { accountId: string; amount: number; reason: string };
type Output = { accountId: string };
type Context = {};

export const creditAccountCommand = (eventStore: EventStore) =>
  new Command({
    commandId: 'CREDIT_ACCOUNT',
    requiredEventStores: tuple(eventStore),
    handler: async (
      commandInput: Input,
      [eventStore],
      {}: Context,
    ): Promise<Output> => {
      const { accountId, amount, reason } = commandInput;

      const { aggregate: accountAggregate } =
        await eventStore.getAggregate(accountId);

      if (accountAggregate === undefined) {
        throw new Error(`Account with id ${accountId} does not exist`);
      }

      const { version: accountVersion } = accountAggregate;

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

      return { accountId };
    },
  });
