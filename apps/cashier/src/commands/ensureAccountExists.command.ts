import { EventStore } from '@castore/core';
import { Command, tuple } from '@castore/core';

type Input = {
  accountId: string;
  primaryWalletAddress: string;
  initialDeposit: number;
  addVipBalance: boolean;
};
type Output = { accountId: string };
type Context = {};

export const ensureAccountExistsCommand = (eventStore: EventStore) =>
  new Command({
    commandId: 'ENSURE_ACCOUNT_EXISTS',
    requiredEventStores: tuple(eventStore),
    handler: async (
      commandInput: Input,
      [eventStore],
      {}: Context,
    ): Promise<Output> => {
      const { accountId, primaryWalletAddress, initialDeposit, addVipBalance } =
        commandInput;

      const { aggregate: accountAggregate } =
        await eventStore.getAggregate(accountId);

      if (!accountAggregate) {
        await eventStore.pushEvent({
          aggregateId: accountId,
          version: 1,
          type: 'ACCOUNT_CREATED',
          payload: { primaryWalletAddress, accountId },
        });
        await eventStore.pushEvent({
          aggregateId: accountId,
          version: 2,
          type: 'ACCOUNT_CREDITED',
          payload: {
            accountId,
            amount: initialDeposit,
            reason: 'INITIAL_DEPOSIT',
          },
        });
        if (addVipBalance) {
          await eventStore.pushEvent({
            aggregateId: accountId,
            version: 3,
            type: 'ACCOUNT_CREDITED',
            payload: {
              accountId,
              amount: initialDeposit,
              reason: 'INITIAL_DEPOSIT',
              vip: true,
            },
          });
        }
      }

      return { accountId };
    },
  });
