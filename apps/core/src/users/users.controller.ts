import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EnsureUserIdMessage } from 'core-messages';
import { UsersService } from './users.service';

interface EnsureUserIdPayload {
  walletAddress: string;
}

@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @MessagePattern(EnsureUserIdMessage.messageType)
  async handleEnsureUserId(@Payload() data: EnsureUserIdPayload) {
    const { walletAddress } = data;

    let userId =
      await this.usersService.getUserIdByWalletAddress(walletAddress);
    if (!userId) {
      const user = await this.usersService.createUser(walletAddress);
      userId = user.userId;
    }

    return { success: true, userId };
  }
}
