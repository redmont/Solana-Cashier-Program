import { UsersService } from '@/users/users.service';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sendBrokerCommand } from 'broker-comms';
import { CreditMessage, CreditMessageResponse } from 'cashier-messages';
import { getAddress } from 'viem';

export interface ZealyQuestCompletedEvent {
  ethereumAddress: string;
  xp: number;
  timestamp: number;
}

@Injectable()
export class ZealyService {
  private readonly xpConversionRate: number;

  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
    private readonly broker: NatsJetStreamClientProxy,
  ) {
    this.xpConversionRate = this.config.get<number>('zealyXpConversionRate');
  }

  async processEvent({
    ethereumAddress,
    xp,
    timestamp,
  }: ZealyQuestCompletedEvent) {
    const formattedAddress = getAddress(ethereumAddress);

    // Check if user exists
    let userId =
      await this.usersService.getUserIdByWalletAddress(formattedAddress);
    if (!userId) {
      // Create user
      const user = await this.usersService.createUser(formattedAddress);
      userId = user.userId;
    }

    const amount = xp * this.xpConversionRate;

    const result = await sendBrokerCommand<
      CreditMessage,
      CreditMessageResponse
    >(this.broker, new CreditMessage(userId, amount, 'ZEALY'));
  }
}
