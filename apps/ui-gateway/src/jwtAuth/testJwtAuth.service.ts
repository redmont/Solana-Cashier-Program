import { Injectable } from '@nestjs/common';
import { IJwtAuthService } from './jwtAuth.interface';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TestJwtAuthService implements IJwtAuthService {
  private readonly secret = 'test-secret-key';
  private readonly dynamicPublicKey: string;

  constructor(private readonly configService: ConfigService) {
    this.dynamicPublicKey = this.configService.get<string>('dynamicPublicKey');
  }

  public async sign(payload: object): Promise<string> {
    return jwt.sign(payload, this.secret, { expiresIn: '24h' });
  }

  async verify(token: string): Promise<any> {
    const decodedToken = jwt.decode(token) as jwt.JwtPayload;

    if (decodedToken.iss.indexOf('dynamicauth') > -1) {
      return jwt.verify(token, this.dynamicPublicKey, {
        algorithms: ['RS256'],
      });
    }

    return jwt.verify(token, this.secret);
  }

  public decode(token: string) {
    return jwt.decode(token);
  }
}
