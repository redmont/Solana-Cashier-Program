import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  RequestWithdrawalMessage,
  RequestWithdrawalMessageResponse,
  MarkWithdrawalAsCompleteMessage,
} from 'core-messages';
import { WithdrawalsService } from './withdrawals.service';

@Controller()
export class WithdrawalsController {
  constructor(private readonly service: WithdrawalsService) {}

  @MessagePattern({ cmd: RequestWithdrawalMessage.messageType })
  async handleRequestWithdrawal(
    @Payload()
    {
      userId,
      chainId,
      tokenSymbol,
      walletAddress,
      creditAmount,
    }: RequestWithdrawalMessage,
  ): Promise<RequestWithdrawalMessageResponse> {
    const result = await this.service.createWithdrawal({
      userId,
      chainId,
      tokenSymbol,
      walletAddress,
      creditAmount,
    });

    if (result.isErr()) {
      return { success: false, message: result.error };
    }

    return { success: true };
  }

  @MessagePattern({ cmd: MarkWithdrawalAsCompleteMessage.messageType })
  async handleMarkWithdrawalAsComplete(
    @Payload()
    { userId, receiptId, transactionHash }: MarkWithdrawalAsCompleteMessage,
  ) {
    const result = await this.service.markWithdrawalAsComplete(
      userId,
      receiptId,
      transactionHash,
    );

    if (result.isErr()) {
      return { success: false, message: result.error };
    }

    return { success: true };
  }
}
