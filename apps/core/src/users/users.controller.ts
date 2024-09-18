import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EnsureUserIdMessage } from 'core-messages';
import { UsersService } from './users.service';

interface EnsureUserIdPayload {
  walletAddress: string;
  initialBalance?: number;
}

@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @MessagePattern({ cmd: EnsureUserIdMessage.messageType })
  async handleEnsureUserId(
    @Payload() { walletAddress, initialBalance }: EnsureUserIdPayload,
  ) {
    let userId =
      await this.usersService.getUserIdByWalletAddress(walletAddress);
    if (!userId) {
      const user = await this.usersService.createUser(
        walletAddress,
        initialBalance,
      );
      userId = user.userId;
    }

    return { success: true, userId };
  }
}
