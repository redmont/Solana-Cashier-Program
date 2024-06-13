import { Key } from '@/interfaces/key';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel, Model } from 'nestjs-dynamoose';
import * as jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import dayjs from '@/dayjs';
import { StreamToken } from './streamToken.interface';

const millicastApiUrl = 'https://api.millicast.com/api';

@Injectable()
export class StreamTokenService {
  private readonly apiSecret: string;
  private readonly streamName: string;
  private readonly parentSubscribeToken: string;
  private readonly parentSubscribeTokenId: string;
  private readonly allowedOrigins: string[];

  constructor(
    private readonly configService: ConfigService,
    @InjectModel('streamToken')
    private readonly streamTokenModel: Model<StreamToken, Key>,
  ) {
    this.apiSecret = this.configService.get('millicastApiSecret');
    this.streamName = this.configService.get('millicastStreamName');
    this.parentSubscribeToken = this.configService.get(
      'millicastParentSubscribeToken',
    );
    this.parentSubscribeTokenId = this.configService.get(
      'millicastParentSubscribeTokenId',
    );

    const allowedOrigins = this.configService.get<string>(
      'millicastAllowedOrigins',
    );
    if (allowedOrigins?.length > 0) {
      this.allowedOrigins = allowedOrigins.split(',');
    } else {
      this.allowedOrigins = [];
    }
  }

  private async generateToken(userId: string) {
    const id = uuid();

    const payload = {
      streaming: {
        tokenType: 'Subscribe',
        tokenId: parseInt(this.parentSubscribeTokenId),
        streamName: this.streamName,
        allowedOrigins: this.allowedOrigins,
        allowedIpAddresses: [],
        tracking: {
          trackingId: `user#${userId}`,
        },
      },
    };

    const signedToken = jwt.sign(payload, this.parentSubscribeToken, {
      algorithm: 'HS256',
      expiresIn: '1m',
    });

    const decodedToken = jwt.decode(signedToken) as jwt.JwtPayload;

    const expiresAt = dayjs.utc(decodedToken.exp * 1000).toISOString();

    /*
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${this.apiSecret}`,
      },
      body: JSON.stringify({
        streams: [{ isRegex: false, streamName: 'brawlers-prod-2' }],
        label: `user#${userId}`,
        expires: 14400, // 4 hours
        bindIpsOnUsage: 2,
      }),
    };

    const response = await fetch(`${millicastApiUrl}/subscribe_token`, options);
    const responseData = (await response.json()) as {
      data: {
        id: number;
        token: string;
        expiresOn: string;
      };
    };

    const { id, token, expiresOn } = responseData.data;

    */

    return {
      id,
      token: signedToken,
      expiresAt,
    };
  }

  private async deleteToken(tokenId: string) {
    const options = {
      method: 'DELETE',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${this.apiSecret}`,
      },
    };

    const response = await fetch(
      `${millicastApiUrl}/subscribe_token/${tokenId}`,
      options,
    );
  }

  async getToken(userId: string) {
    // Generate a token for the user
    const generateTokenResult = await this.generateToken(userId);

    // Save the token to the database
    const streamToken = {
      pk: `streamToken#${userId}`,
      sk: dayjs.utc().toISOString(),
      expiresAt: generateTokenResult.expiresAt,
      tokenId: generateTokenResult.id.toString(),
      token: generateTokenResult.token,
    };

    await this.streamTokenModel.create(streamToken);

    // Get all user tokens
    const existingTokens = await this.streamTokenModel
      .query({ pk: `streamToken#${userId}` })
      .exec();

    if (existingTokens.length > 2) {
      // Delete all except the last two tokens
      const tokensToDelete = existingTokens.slice(0, -2);
      for (const token of tokensToDelete) {
        //await this.deleteToken(token.tokenId);
        await this.streamTokenModel.delete(token);
      }
    }

    return generateTokenResult.token;
  }
}
