import { Controller } from '@nestjs/common';
import { DailyClaimService } from './dailyClaim.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ClaimDailyClaimMessage,
  ClaimDailyClaimMessageResponse,
} from 'core-messages';

@Controller()
export class DailyClaimController {
  constructor(private readonly dailyClaimService: DailyClaimService) {}

  @MessagePattern({ cmd: ClaimDailyClaimMessage.messageType })
  async handlePlaceBet(
    @Payload() data: ClaimDailyClaimMessage,
  ): Promise<ClaimDailyClaimMessageResponse> {
    const claimResult = await this.dailyClaimService.claim(
      data.userId,
      data.amount,
    );
    if (claimResult.isErr()) {
      return {
        success: false,
        message: claimResult.error,
      };
    }

    return {
      success: true,
      data: claimResult.value,
    };
  }
}
