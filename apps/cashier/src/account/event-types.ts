import { EventType } from "@castore/core";

export const accountCreatedEventType = new EventType<"ACCOUNT_CREATED", {}>({
  type: "ACCOUNT_CREATED",
});

export const creditEventType = new EventType<
  "ACCOUNT_CREDITED",
  { accountId: string; amount: number }
>({ type: "ACCOUNT_CREDITED" });

export const debitEventType = new EventType<
  "ACCOUNT_DEBITED",
  { accountId: string; amount: number }
>({ type: "ACCOUNT_DEBITED" });
