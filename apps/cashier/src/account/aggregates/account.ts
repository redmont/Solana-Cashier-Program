import type { Aggregate } from "@castore/core";

export interface AccountAggregate extends Aggregate {
  accountId: string;
  balance: number;
}
