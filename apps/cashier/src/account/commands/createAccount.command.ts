import { EventStore } from '@castore/core';
import { Command, tuple } from '@castore/core';

type Input = { accountId: string; primaryWalletAddress: string };
type Output = { accountId: string };
type Context = {};

export const createAccountCommand = (eventStore: EventStore) =>
  new Command({
    commandId: 'CREATE_ACCOUNT',
    requiredEventStores: tuple(eventStore),
    handler: async (
      commandInput: Input,
      [eventStore],
      {}: Context,
    ): Promise<Output> => {
      const { accountId, primaryWalletAddress } = commandInput;

      await eventStore.pushEvent({
        aggregateId: accountId,
        version: 1,
        type: 'ACCOUNT_CREATED',
        payload: { primaryWalletAddress, accountId },
      });

      return { accountId };
    },
  });
