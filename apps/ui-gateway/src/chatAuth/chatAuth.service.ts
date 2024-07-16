import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PubNub from 'pubnub';

@Injectable()
export class ChatAuthService {
  private pubNub: PubNub;

  constructor(configService: ConfigService) {
    this.pubNub = new PubNub({
      subscribeKey: configService.get<string>('pubNubSubscribeKey'),
      publishKey: configService.get<string>('pubNubPublishKey'),
      secretKey: configService.get<string>('pubNubSecretKey'),
      userId: configService.get<string>('pubNubUserId'),
    });
  }

  private async grantToken(
    parameters: PubNub.GrantTokenParameters,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.pubNub.grantToken(parameters, (status, response) => {
        if (status.error) {
          reject(status.errorData);
        } else {
          resolve(response);
        }
      });
    });
  }

  private async updateMetadata({ username }: { username: string }) {
    return new Promise((resolve, reject) => {
      this.pubNub.objects.setUUIDMetadata(
        {
          uuid: `chat_${username}`,
          data: {
            name: username,
          },
        },
        (status, response) => {
          if (status.error) {
            reject(status.errorData);
          } else {
            resolve(response);
          }
        },
      );
    });
  }

  async getAuthToken(userId?: string, username?: string) {
    let grantTokenParams: PubNub.GrantTokenParameters;
    let authorizedUuid: string;
    const channels = ['brawlers-general'];

    if (userId && username) {
      channels.push(`brawlers-user-${userId}`);
      authorizedUuid = `chat_${userId}`;

      await this.updateMetadata({ username: userId });

      // Ensure there is a channel for the user
      this.pubNub.objects.setChannelMetadata({
        channel: `brawlers-user-${userId}`,
        data: {
          name: userId,
        },
      });

      grantTokenParams = {
        ttl: 24 * 60,
        authorized_uuid: authorizedUuid,
        resources: {
          channels: {
            'brawlers-general': {
              get: true,
              read: true,
              write: true,
            },
            [`brawlers-user-${userId}`]: {
              get: true,
              read: true,
            },
          },
          uuids: {
            [`chat_${userId}`]: {
              get: true,
            },
          },
        },
        meta: {
          username,
        },
      };
    } else {
      authorizedUuid = `chat_anonymous`;
      grantTokenParams = {
        ttl: 60,
        authorized_uuid: authorizedUuid,
        resources: {
          channels: {
            'brawlers-general': {
              get: true,
              read: true,
            },
          },
          uuids: {
            [`chat_anonymous`]: {
              get: true,
            },
          },
        },
      };
    }

    // Todo - store tokens in cache or database
    const token = await this.grantToken(grantTokenParams);
    return {
      token,
      authorizedUuid,
      channels,
    };
  }
}
