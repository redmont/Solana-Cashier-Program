import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PubNub from 'pubnub';

@Injectable()
export class ChatService {
  private readonly pubNub: PubNub;

  constructor(readonly config: ConfigService) {
    this.pubNub = new PubNub({
      subscribeKey: config.get<string>('pubNubSubscribeKey'),
      publishKey: config.get<string>('pubNubPublishKey'),
      secretKey: config.get<string>('pubNubSecretKey'),
      userId: config.get<string>('pubNubUserId'),
    });
  }

  async sendSystemMessage({
    userId,
    message,
  }: {
    userId?: string;
    message: string;
  }) {
    const channel = userId ? `brawlers-user-${userId}` : 'brawlers-general';
    await this.pubNub.publish({
      channel,
      message,
    });
  }
}
