import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisCacheService } from 'global-cache';
import PubNub from 'pubnub';

const username = 'system';

@Injectable()
export class ChatService {
  private readonly logger: Logger = new Logger(ChatService.name);

  private readonly pubNub: PubNub;
  private token: [string, number];

  constructor(
    readonly config: ConfigService,
    private readonly cache: RedisCacheService,
  ) {
    this.pubNub = new PubNub({
      subscribeKey: config.get<string>('pubNubSubscribeKey'),
      publishKey: config.get<string>('pubNubPublishKey'),
      secretKey: config.get<string>('pubNubSecretKey'),
      userId: config.get<string>('pubNubUserId'),
      logVerbosity: true,
    });

    this.ensureToken();
  }

  private async ensureToken() {
    if (this.token && this.token[1] > Date.now() + 60 * 1000) {
      return this.token[0];
    }

    const ttl = 24 * 60;
    const expiry = Math.floor(Date.now() / 1000) + ttl;

    const grantTokenParams = {
      ttl,
      authorized_uuid: 'system',
      resources: {
        channels: {
          '.*': {
            get: true,
            read: true,
            write: true,
          },
        },
      },
      meta: {
        username,
      },
    };

    const pubNubToken = await this.pubNub.grantToken(grantTokenParams);

    this.token = [pubNubToken, expiry];

    this.pubNub.setToken(pubNubToken);
  }

  async channelExists(channel: string) {
    return (await this.cache.get(`chat:channel:${channel}`)) === '1';
  }

  async sendSystemMessage({
    userId,
    message,
  }: {
    userId?: string;
    message: string;
  }) {
    await this.ensureToken();

    const channel = userId ? `brawlers-user-${userId}` : 'brawlers-general';

    if (userId && !this.channelExists(channel)) {
      return;
    }

    try {
      await this.pubNub.publish({
        channel,
        message: {
          text: message,
          username,
          type: 'text',
        },
        meta: {
          type: 'markdown',
        },
      });
    } catch (e) {
      this.logger.error('Failed to send message', e);
    }
  }
}
