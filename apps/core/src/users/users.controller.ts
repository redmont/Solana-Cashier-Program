import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { EnsureUserIdMessage } from 'core-messages';

interface EnsureUserIdPayload {
  walletAddress: string;
}

@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @MessagePattern(EnsureUserIdMessage.messageType)
  async handleEnsureUserId(@Payload() data: EnsureUserIdPayload) {
    console.log("Handling 'EnsureUserIdMessage'");
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
