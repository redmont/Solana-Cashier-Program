import { Command, EventStore, tuple } from '@castore/core';

type Input = {
  accountId: string;
  receiptId: string;
  transactionHash: string;
  confirmed: boolean;
};
type Output = {};
type Context = {};

export class WithdrawalNotPendingOrUnconfirmedError extends Error {}

export const markWithdrawalAsCompleteCommand = (eventStore: EventStore) =>
  new Command({
    commandId: 'MARK_WITHDRAWAL_AS_COMPLETE',
    requiredEventStores: tuple(eventStore),
    handler: async (
      commandInput: Input,
      [eventStore],
      {}: Context,
    ): Promise<Output> => {
      const { accountId, receiptId, transactionHash, confirmed } = commandInput;

      const { aggregate: withdrawalAggregate } =
        await eventStore.getAggregate(receiptId);

      if (withdrawalAggregate === undefined) {
        throw new Error(`Withdrawal with id ${receiptId} does not exist`);
      }

      const { version: accountVersion } = withdrawalAggregate;

      if (
        (withdrawalAggregate as any).status !== 'PENDING' &&
        (withdrawalAggregate as any).status !== 'COMPLETED_UNCONFIRMED'
      ) {
        // There is no need to throw an error here, as it could be a race condition
        return {};
      }

      const eventType = confirmed
        ? 'WITHDRAWAL_COMPLETED_CONFIRMED'
        : 'WITHDRAWAL_COMPLETED_UNCONFIRMED';

      await eventStore.pushEvent(
        {
          aggregateId: receiptId,
          version: accountVersion + 1,
          type: eventType,
          payload: { accountId, receiptId, transactionHash },
        },
        {
          prevAggregate: withdrawalAggregate,
        },
      );

      return {};
    },
  });
