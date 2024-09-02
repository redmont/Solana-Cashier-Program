import { ConnectedEventStore } from '@castore/core';
import { Injectable, Logger } from '@nestjs/common';
import { creditAccountCommand } from '@/account/commands/creditAccount.command';
import { decodeEventLog, formatUnits, hexToString } from 'viem';
import { ReadModelService } from 'cashier-read-model';

export interface ChainEvent {
  transactionHash: `0x${string}`;
  topics: [signature: `0x${string}`, ...args: `0x${string}`[]];
  data: `0x${string}`;
}

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
  private readonly logger = new Logger(ChainEventsService.name);

  constructor(
    private readonly eventStore: ConnectedEventStore,
    private readonly readModelService: ReadModelService,
  ) {}

  async processEvent(event: ChainEvent) {
    const { transactionHash } = event;

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

    const creditPrice = 99;

    // Calculate credit amount, considering everything is 6 decimal places
    const creditAmount = Math.ceil(parseFloat(args.amount) / creditPrice);

    const amount = parseFloat(formatUnits(args.amount, 6)); // USDC is 6 decimal places

    const accountId = hexToString(args.userId);

    this.logger.log(
      `Deposited ${creditAmount} credits for ${amount} to '${accountId}'`,
    );

    await creditAccountCommand(this.eventStore).handler(
      {
        accountId,
        amount: creditAmount,
        reason: 'CHAIN_DEPOSIT',
        transactionHash,
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
      this.logger.error(
        `Account not found for wallet address ${walletAddress}`,
      );
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
