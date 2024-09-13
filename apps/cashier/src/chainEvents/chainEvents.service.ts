import { ConnectedEventStore } from '@castore/core';
import { decodeEventLog, formatUnits, parseUnits, hexToString } from 'viem';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ReadModelService } from 'cashier-read-model';
import {
  creditAccountCommand,
  markWithdrawalAsCompleteCommand,
} from '@/commands';

export interface ChainEvent {
  eventName: string;
  transactionHash: `0x${string}`;
  topics: [signature: `0x${string}`, ...args: `0x${string}`[]];
  data: `0x${string}`;
}

export interface chainEventSolana {
  userId: string;
  fromTokenAccount: string;
  fromUserAccount: string;
  mint: string;
  toTokenAccount: string;
  toUserAccount: string;
  tokenAmount: number;
  tokenStandard: string;
}

const getCreditAmount = (amount: number) => {
  const creditPrice = 99;

  // Calculate credit amount, considering everything is 6 decimal places
  const creditAmount = Math.ceil(parseInt(amount.toString()) / creditPrice);
  return creditAmount;
};

@Injectable()
export class ChainEventsService {
  private readonly logger = new Logger(ChainEventsService.name);

  constructor(
    @Inject('AccountsConnectedEventStore')
    private readonly eventStore: ConnectedEventStore,
    private readonly readModelService: ReadModelService,
  ) {}

  async processDeposit(event: ChainEvent) {
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

    // Determine price
    const creditAmount = getCreditAmount(args.amount);

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

  async processWithdrawal(event: ChainEvent) {
    const withdrawalPaidOutEvent = decodeEventLog({
      abi: [
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'address',
              name: 'walletAddress',
              type: 'address',
            },
            {
              indexed: true,
              internalType: 'bytes16',
              name: 'receiptId',
              type: 'bytes16',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
          ],
          name: 'WithdrawalPaidOut',
          type: 'event',
        },
      ],
      eventName: 'WithdrawalPaidOut',
      data: event.data,
      topics: event.topics,
    });

    const accounts = await this.readModelService.getAccountByWalletAddress(
      withdrawalPaidOutEvent.args.walletAddress,
    );
    if (accounts?.length > 0) {
      const accountId = accounts[0].sk.split('#')[1];

      const receiptId = withdrawalPaidOutEvent.args.receiptId.replace('0x', '');

      await markWithdrawalAsCompleteCommand(this.eventStore).handler(
        {
          accountId,
          receiptId,
          transactionHash: event.transactionHash,
          confirmed: true,
        },
        [this.eventStore],
        {},
      );
    }
  }

  async processEvent(event: ChainEvent) {
    const { eventName } = event;

    if (eventName === 'DepositReceived') {
      await this.processDeposit(event);
    }

    if (eventName === 'WithdrawalPaidOut') {
      await this.processWithdrawal(event);
    }
  }

  async processEventSolana(event: chainEventSolana) {
    const { fromUserAccount: walletAddress, tokenAmount, userId } = event;

    const accountId = userId;
    const usdcAmount = parseInt(
      parseUnits(tokenAmount.toString(), 6).toString(),
    ); // USDC is 6 decimal places

    // Determine price
    const creditAmount = getCreditAmount(usdcAmount);

    console.log(
      `Deposited ${creditAmount} credits from solana chain for ${usdcAmount} USDC to walletAddress: ${walletAddress}: userId: ${accountId}`,
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
}
