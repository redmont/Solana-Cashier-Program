import { Inject, Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { v4 as uuid } from 'uuid';
import { DateTime } from 'luxon';
import { recoverMessageAddress } from 'viem';
import { Key } from 'src/interfaces/key';
import { JWT_AUTH_SERVICE } from 'src/jwt-auth/jwt-auth.constants';
import { IJwtAuthService } from 'src/jwt-auth/jwt-auth.interface';
import { Nonce } from './nonce.interface';
import { ClientProxy } from '@nestjs/microservices';
import { sendBrokerMessage } from 'broker-comms';
import {
  EnsureUserIdMessage,
  EnsureUserIdMessageReturnType,
} from 'core-messages';
import { ConfigService } from '@nestjs/config';

const welcomeMessage = `Welcome to Brawlers!\nSign this message to continue.\n\n`;

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel('nonce')
    private readonly nonceModel: Model<Nonce, Key>,
    @Inject(JWT_AUTH_SERVICE) private readonly jwtAuthService: IJwtAuthService,
    @Inject('BROKER') private broker: ClientProxy,
  ) {}

  async getNonceMessage(walletAddress: string) {
    const nonce = uuid().replace(/-/g, '');

    this.nonceModel.create({
      pk: `nonce#${walletAddress.toLowerCase()}`,
      sk: nonce,
      timestamp: DateTime.utc().toISO(),
    });

    const messageToSign = welcomeMessage + nonce;

    return messageToSign;
  }

  async getToken(
    walletAddress: string,
    message: string,
    signedMessage: string,
  ) {
    const recoveredAddress = await recoverMessageAddress({
      message,
      signature: signedMessage as `0x${string}`,
    });

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error('Invalid signature');
    }

    const nonce = message.substring(welcomeMessage.length);

    const nonceEntry = await this.nonceModel.get({
      pk: `nonce#${walletAddress.toLowerCase()}`,
      sk: nonce,
    });
    if (!nonceEntry) {
      throw new Error('Invalid signature');
    }

    await this.nonceModel.delete({
      pk: `nonce#${walletAddress.toLowerCase()}`,
      sk: nonce,
    });

    const timestamp = DateTime.fromISO(nonceEntry.timestamp);
    const nonceAge = DateTime.utc().diff(timestamp);
    if (
      nonceAge.as('milliseconds') > this.configService.get<number>('nonceTtl')
    ) {
      return new Error('Invalid nonce');
    }

    const result = await sendBrokerMessage<
      EnsureUserIdMessage,
      EnsureUserIdMessageReturnType
    >(this.broker, new EnsureUserIdMessage(walletAddress));

    const { userId } = result;

    const payload = {
      sub: userId,
      claims: {
        walletAddress,
      },
    };

    const token = await this.jwtAuthService.sign(payload);

    return {
      access_token: token,
    };
  }
}
