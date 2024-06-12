import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  private readonly dynamicPublicKey: string;

  constructor(private readonly configService: ConfigService) {
    this.dynamicPublicKey = this.configService.get<string>('dynamicPublicKey');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const decodedToken = jwt.verify(token, this.dynamicPublicKey, {
        algorithms: ['RS256'],
      }) as jwt.JwtPayload;

      if (
        decodedToken.iss &&
        decodedToken.iss.indexOf('dynamicauth') > -1 &&
        decodedToken.scope?.includes('admin')
      ) {
        return true;
      }

      return false;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
