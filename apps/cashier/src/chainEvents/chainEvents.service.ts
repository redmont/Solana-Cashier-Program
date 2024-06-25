import { ConnectedEventStore } from '@castore/core';
import { Injectable } from '@nestjs/common';
import { creditAccountCommand } from 'src/account/commands/creditAccount.command';
import { decodeEventLog, formatUnits, hexToString } from 'viem';

export interface ChainEvent {
  topics: [signature: `0x${string}`, ...args: `0x${string}`[]];
  data: `0x${string}`;
}

@Injectable()
export class ChainEventsService {
  constructor(private readonly eventStore: ConnectedEventStore) {}

  async processEvent(event: ChainEvent) {
    const depositEvent = decodeEventLog({
      abi: [
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'bytes32',
              name: 'userId',
              type: 'bytes32',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'token',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
          ],
          name: 'DepositReceived',
          type: 'event',
        },
      ],
      eventName: 'DepositReceived',
      data: event.data,
      topics: event.topics,
    });

    const args = depositEvent.args as any;

    const amount = parseInt(formatUnits(args.amount, 6)); // USDC is 6 decimal places
    const accountId = hexToString(args.userId);

    console.log('Deposit event received', depositEvent, amount, accountId);

    await creditAccountCommand(this.eventStore).handler(
      {
        accountId,
        amount,
        reason: 'CHAIN_DEPOSIT',
      },
      [this.eventStore],
      {},
    );
  }
}
