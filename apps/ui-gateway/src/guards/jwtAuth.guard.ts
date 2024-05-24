import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { IJwtAuthService } from '../jwtAuth/jwtAuth.interface';
import { JWT_AUTH_SERVICE } from '../jwtAuth/jwtAuth.constants';
import { ClientProxy } from '@nestjs/microservices';
import {
  EnsureUserIdMessage,
  EnsureUserIdMessageReturnType,
} from 'core-messages';
import { sendBrokerMessage } from 'broker-comms';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(JWT_AUTH_SERVICE) private readonly jwtAuthService: IJwtAuthService,
    @Inject('BROKER') private broker: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = client.handshake.auth.token;

    if (typeof token === 'undefined') {
      throw new WsException('Missing token');
    }

    return this.jwtAuthService
      .verify(token)
      .then(async (decodedToken) => {
        if (
          decodedToken.verified_credentials &&
          decodedToken.verified_credentials.length > 0
        ) {
          const { address } = decodedToken.verified_credentials[0];

          const { userId } = await sendBrokerMessage<
            EnsureUserIdMessage,
            EnsureUserIdMessageReturnType
          >(this.broker, new EnsureUserIdMessage(address));

          client.data.authorizedUser = {
            userId,
            walletAddress: address,
          };
        } else {
          client.data.authorizedUser = {
            userId: decodedToken.sub,
            walletAddress: decodedToken.claims.walletAddress,
          };
        }

        return true;
      })
      .catch((error) => {
        throw new WsException(error.message);
      });
  }
}
