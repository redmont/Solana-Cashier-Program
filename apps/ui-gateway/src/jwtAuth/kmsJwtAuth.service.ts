import { Injectable } from '@nestjs/common';
import { IJwtAuthService } from './jwtAuth.interface';
import { KMSClient, SignCommand, VerifyCommand } from '@aws-sdk/client-kms';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class KmsJwtAuthService implements IJwtAuthService {
  private kms: KMSClient;

  constructor() {
    this.kms = new KMSClient();
  }

  async sign(payload: object): Promise<string> {
    const result = await this.kms.send(
      new SignCommand({
        KeyId: '',
        Message: Buffer.from(JSON.stringify(payload)),
        MessageType: 'RAW',
        SigningAlgorithm: 'RSASSA_PKCS1_V1_5_SHA_256',
      }),
    );

    return Buffer.from(result.Signature!).toString();
  }

  async verify(token: string) {
    throw new Error('Method not implemented.');
  }

  decode(token: string) {
    return jwt.decode(token);
  }
}
