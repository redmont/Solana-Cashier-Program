import {
  Message,
  MessageChannelAdapter,
  PublishMessageOptions,
  StateCarryingMessage,
} from "@castore/core";

import { Injectable } from "@nestjs/common";
import { AccountAggregate } from "src/account/aggregates";
import { ReadModelService } from "src/account/read-model/read-model.service";
import { AccountEventDetails } from "src/account/reducers/accounts-reducer";

@Injectable()
export class QueryModelBusAdapter implements MessageChannelAdapter {
  constructor(private readonly readModelService: ReadModelService) {}

  async publishMessage(
    message: StateCarryingMessage<
      string,
      AccountEventDetails,
      AccountAggregate
    >,
    options?: PublishMessageOptions
  ) {
    await this.readModelService.upsertAccount(
      message.aggregate.accountId,
      message.aggregate.balance
    );

    console.log(message.aggregate);
  }
  publishMessages: (
    messages: Message[],
    options?: PublishMessageOptions
  ) => Promise<void>;
}
