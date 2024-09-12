import { ReadModelKey } from './key.interface';

export interface Withdrawal extends ReadModelKey {
  accountId: string;
  createdAt: string;
  updatedAt: string;
  creditAmount: number;
  chainId: string;
  signature: string;
  tokenSymbol?: string;
  tokenAmount: string;
  tokenDecimals: number;
  validFrom: string;
  validTo: string;
  transactionHash?: string;
  status: string;
  itemType: string;
}
