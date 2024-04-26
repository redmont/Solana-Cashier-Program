import type { Aggregate } from "@castore/core";

export interface AccountAggregate extends Aggregate {
  accountId: string;
  primaryWalletAddress: string;
  balance: number;
}
