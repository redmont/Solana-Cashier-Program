import type { Aggregate } from '@castore/core';

export interface WithdrawalAggregate extends Aggregate {
  receiptId: string;
  accountId: string;
  createdAt: string;
  // CAIP-2 chain ID
  chainId: string;
  // Payout token symbol
  // Native token if null
  tokenSymbol?: string;
  // Payout token address
  // Native token if null
  tokenAddress?: string;
  tokenDecimals: number;
  tokenAmount: string;
  validFrom: string;
  validTo: string;
  refundedAt?: string;
  withdrawnAt?: string;
  signature: string;
  creditAmount: number;
  transactionHash?: string;
}
