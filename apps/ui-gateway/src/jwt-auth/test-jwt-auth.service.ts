import { Injectable } from '@nestjs/common';
import { IJwtAuthService } from './jwt-auth.interface';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TestJwtAuthService implements IJwtAuthService {
  private readonly secret = 'test-secret-key';

  public async sign(payload: object): Promise<string> {
    return jwt.sign(payload, this.secret, { expiresIn: '24h' });
  }

  async verify(token: string): Promise<any> {
    return jwt.verify(token, this.secret);
  }

  public decode(token: string) {
    return jwt.decode(token);
  }
}
