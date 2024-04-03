import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";

import { Controller } from "@nestjs/common";
import { createAccountCommand } from "./commands/create-account.command";
import { ConnectedEventStore } from "@castore/core";
import { creditAccountCommand } from "./commands/credit-account.command";
import { ReadModelService } from "src/account/read-model/read-model.service";
import { debitAccountCommand } from "./commands/debit-account.command";

interface GetBalancePayload {
  accountId: string;
}

interface DebitPayload {
  accountId: string;
  amount: number;
}

interface CreditPayload {
  accountId: string;
  amount: number;
}

@Controller()
export class AccountController {
  constructor(
    private readonly eventStore: ConnectedEventStore,
    private readonly readModelService: ReadModelService
  ) {}

  @MessagePattern("cashier.getBalance")
  async handleGetBalance(@Payload() data: GetBalancePayload) {
    console.log("Handle get balance", data);
    const account = await this.readModelService.getAccount(data.accountId);

    return {
      balance: account.balance,
    };
  }

  @MessagePattern("cashier.debit")
  async handleDebit(@Payload() data: DebitPayload) {
    console.log("Handle debit", data);
    try {
      await debitAccountCommand(this.eventStore).handler(
        {
          accountId: data.accountId,
          amount: data.amount,
        },
        [this.eventStore],
        {}
      );
    } catch (e) {
      console.log("Error debiting account", e);
      return { error: e.message };
    }

    console.log("Debited");

    return {};
  }

  @MessagePattern("cashier.credit")
  async handleCredit(@Payload() data: CreditPayload) {
    console.log("Handle credit", data);
    try {
      await creditAccountCommand(this.eventStore).handler(
        {
          accountId: data.accountId,
          amount: data.amount,
        },
        [this.eventStore],
        {}
      );
    } catch (e) {
      console.log("Error crediting account", e);
      return { error: e.message };
    }

    console.log("Credited");

    return {};
  }

  @EventPattern("user.created")
  async userCreated(@Payload() data: any) {
    console.log("Got user created event");
    console.log("Event store service", this.eventStore);

    await createAccountCommand(this.eventStore).handler(
      {
        accountId: data.userId,
      },
      [this.eventStore],
      {}
    );

    await creditAccountCommand(this.eventStore).handler(
      {
        accountId: data.userId,
        amount: 1000,
      },
      [this.eventStore],
      {}
    );
  }
}
