import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable({})
export class StreamAuthService {
  private readonly parentTokenId: string;
  private readonly parentTokenSecret: string;

  constructor(configService: ConfigService) {
    this.parentTokenId = configService.get<string>('streamAuthParentTokenId');
    this.parentTokenSecret = configService.get<string>(
      'streamAuthParentTokenSecret',
    );
  }

  generateToken(username: string) {
    const payload = {
      tokenType: 'sub',
      parentTokenId: this.parentTokenId,
      username,
      streamName: 'brawlers_dev',
    };

    const signedToken = jwt.sign(payload, this.parentTokenSecret, {
      algorithm: 'HS256',
      expiresIn: '1m',
    });

    return signedToken;
  }

  validateToken(username: string, token: string) {
    try {
      const decoded = jwt.verify(token, this.parentTokenSecret) as {
        tokenType: string;
        parentTokenId: string;
        username: string;
        streamName: string;
        iat: number;
        exp: number;
      };

      if (decoded.tokenType !== 'sub') {
        return false;
      }

      if (decoded.username !== username) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
