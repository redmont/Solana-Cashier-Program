import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { IJwtAuthService } from "./jwt-auth/jwt-auth.interface";
import { JWT_AUTH_SERVICE } from "./jwt-auth/jwt-auth.constants";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(JWT_AUTH_SERVICE) private readonly jwtAuthService: IJwtAuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = client.handshake.auth.token;

    if (typeof token === "undefined") {
      throw new WsException("Missing token");
    }

    return this.jwtAuthService
      .verify(token)
      .then((decodedToken) => {
        client.data.authorizedUser = decodedToken;
        return true;
      })
      .catch((error) => {
        throw new WsException(error.message);
      });
  }
}
