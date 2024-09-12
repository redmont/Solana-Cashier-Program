import { Injectable, OnModuleInit } from '@nestjs/common';
import { encodePacked, keccak256, LocalAccount } from 'viem';
import { randomUUID } from 'crypto';
import { sendBrokerCommand } from 'broker-comms';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import {
  CreateWithdrawalMessage,
  CreateWithdrawalMessageResponse,
  MarkWithdrawalAsCompleteMessage,
  MarkWithdrawalAsCompleteMessageResponse,
} from 'cashier-messages';
import contracts from '@bltzr-gg/brawlers-evm-contracts';
import dayjs from '@/dayjs';
import { WithdrawalSignerService } from './withdrawalSigner.service';
import { err, ok, Result, ResultAsync } from 'neverthrow';

interface CreateWithdrawalParams {
  userId: string;
  chainId: string;
  tokenSymbol: string;
  walletAddress: string;
  creditAmount: number;
}

interface SignWithdrawalParams {
  receiptId: `0x${string}`;
  walletAddress: `0x${string}`;
  amount: bigint;
  validFrom: bigint;
  validTo: bigint;
  chainId: bigint;
}

export enum WithdrawalError {
  AmountTooLow = 'AmountTooLow',
  AmountTooHigh = 'AmountTooHigh',
  ChainNotSupported = 'ChainNotSupported',
  UnspecifiedError = 'UnspecifiedError',
}

@Injectable()
export class WithdrawalsService implements OnModuleInit {
  private account: LocalAccount;

  constructor(
    private readonly broker: NatsJetStreamClientProxy,
    private readonly signer: WithdrawalSignerService,
  ) {}

  async onModuleInit() {
    this.account = await this.signer.getAccount();
  }

  parseChainId(chainId: string) {
    const parts = chainId.split(':');

    return {
      namespace: parts[0],
      reference: parts[1],
    };
  }

  async getValidityPeriod(baseAmount: bigint) {
    // 5 minutes earlier than now, because block timestamps are delayed
    let validFrom = dayjs.utc().add(-5, 'minutes');

    // 24 hour delay for amounts greater than $500
    if (baseAmount >= 500n) {
      validFrom = validFrom.add(1, 'day');
    }

    // Withdrawals expire after 7 days
    const validTo = validFrom.add(7, 'days');

    return { validFrom, validTo };
  }

  validateAmount(baseAmount: bigint): Result<void, WithdrawalError> {
    if (baseAmount < 10n) {
      return err(WithdrawalError.AmountTooLow);
    }

    if (baseAmount > 1000n) {
      return err(WithdrawalError.AmountTooHigh);
    }

    return ok(undefined);
  }

  async createWithdrawal({
    userId,
    chainId,
    tokenSymbol,
    walletAddress,
    creditAmount,
  }: CreateWithdrawalParams): Promise<ResultAsync<void, WithdrawalError>> {
    const createdAt = dayjs.utc().toISOString();

    const receiptId = randomUUID().toString().replaceAll('-', '');
    const hexReceiptId: `0x${string}` = `0x${receiptId}`;

    const { reference } = this.parseChainId(chainId);

    const withdrawalContract = contracts.CashierWithdraw[reference];
    if (!withdrawalContract) {
      return err(WithdrawalError.ChainNotSupported);
    }

    const tokenAddress = withdrawalContract.address;

    const creditPrice = BigInt(99); // Credit price, considering 6 decimal places.
    const tokenDecimals = 6;

    // Account for 5% fee
    // This essentially means we give out 5% less tokens
    const creditAmountWithFee = Math.floor((creditAmount * 95) / 100);
    const amount = BigInt(creditAmountWithFee) * creditPrice;
    const baseAmount = BigInt(amount) / BigInt(10 ** tokenDecimals);

    const validationResult = this.validateAmount(baseAmount);
    if (validationResult.isErr()) {
      return err(validationResult.error);
    }

    const { validFrom, validTo } = await this.getValidityPeriod(baseAmount);

    const signature = await this.signWithdrawal({
      receiptId: hexReceiptId,
      walletAddress: walletAddress as `0x${string}`,
      amount,
      validFrom: BigInt(validFrom.unix()),
      validTo: BigInt(validTo.unix()),
      chainId: BigInt(parseInt(reference)),
    });

    const result = await sendBrokerCommand<
      CreateWithdrawalMessage,
      CreateWithdrawalMessageResponse
    >(
      this.broker,
      new CreateWithdrawalMessage({
        receiptId,
        accountId: userId,
        chainId,
        tokenDecimals,
        tokenAmount: amount.toString(),
        signature,
        creditAmount,
        createdAt,
        tokenSymbol,
        tokenAddress,
        validFrom: validFrom.toISOString(),
        validTo: validTo.toISOString(),
      }),
    );

    if (!result.success) {
      return err(WithdrawalError.UnspecifiedError);
    }

    return ok(undefined);
  }

  async signWithdrawal({
    receiptId,
    walletAddress,
    amount,
    validFrom,
    validTo,
    chainId,
  }: SignWithdrawalParams) {
    const message = keccak256(
      encodePacked(
        ['bytes16', 'address', 'uint256', 'uint256', 'uint256', 'uint256'],
        [receiptId, walletAddress, amount, validFrom, validTo, chainId],
      ),
    );

    const signature = await this.account.signMessage({
      message: { raw: message },
    });
    return signature;
  }

  async markWithdrawalAsComplete(
    userId: string,
    receiptId: string,
    transactionHash: string,
  ) {
    const result = await sendBrokerCommand<
      MarkWithdrawalAsCompleteMessage,
      MarkWithdrawalAsCompleteMessageResponse
    >(
      this.broker,
      new MarkWithdrawalAsCompleteMessage(userId, receiptId, transactionHash),
    );

    if (!result.success) {
      return err(WithdrawalError.UnspecifiedError);
    }

    return ok(undefined);
  }
}
