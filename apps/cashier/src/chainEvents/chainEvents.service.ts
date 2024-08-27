import { ConnectedEventStore } from '@castore/core';
import { Injectable } from '@nestjs/common';
import { creditAccountCommand } from 'src/account/commands/creditAccount.command';
import { decodeEventLog, formatUnits, hexToString } from 'viem';
import { ReadModelService } from 'cashier-read-model';

export interface ChainEvent {
  topics: [signature: `0x${string}`, ...args: `0x${string}`[]];
  data: `0x${string}`;
}

// 6 decimal places
// amount spent: price per credit
const priceBrackets = {
  0: 99,
  5000000: 91,
  10000000: 87,
  50000000: 83,
  100000000: 80,
  300000000: 75,
  1000000000: 67,
  7500000000: 60,
};
export interface chainEventSolana {
  fromTokenAccount: string;
  fromUserAccount: string;
  mint: string;
  toTokenAccount: string;
  toUserAccount: string;
  tokenAmount: number;
  tokenStandard: string;
}

@Injectable()
export class ChainEventsService {
  constructor(
    private readonly eventStore: ConnectedEventStore,
    private readonly readModelService: ReadModelService,
  ) {}

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

    // Determine price
    let creditPrice = 0;
    for (const [minAmount, bracket] of Object.entries(priceBrackets)) {
      if (args.amount >= parseInt(minAmount)) {
        creditPrice = bracket;
      }
    }

    // Calculate credit amount, considering everything is 6 decimal places
    const creditAmount = Math.ceil(parseInt(args.amount) / creditPrice);

    const amount = parseInt(formatUnits(args.amount, 6)); // USDC is 6 ecimal places

    const accountId = hexToString(args.userId);

    console.log(
      `Deposited ${creditAmount} credits for ${amount} to '${accountId}'`,
    );

    await creditAccountCommand(this.eventStore).handler(
      {
        accountId,
        amount: creditAmount,
        reason: 'CHAIN_DEPOSIT',
      },
      [this.eventStore],
      {},
    );
  }
  async processEventSolana(event: chainEventSolana) {
    const { fromUserAccount: walletAddress, tokenAmount: amount } = event;

    const accounts =
      await this.readModelService.getAccountByWalletAddress(walletAddress);
    if (accounts.length === 0) {
      console.log('Account not found');
      return { success: false, error: 'Account not found' };
    }

    const accountId = accounts[0].sk.split('#')[1];

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
