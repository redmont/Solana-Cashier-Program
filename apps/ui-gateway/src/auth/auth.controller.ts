import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Ip,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';

export class GetNonceDto {
  walletAddress: string;
}

export class GetTokenDto {
  walletAddress: string;
  message: string;
  signedMessage: string;
  username: string;
  initialBalance?: number;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  isPrivateNetworkRequest(ip: string) {
    return (
      ip === '127.0.0.1' ||
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      ip.startsWith('172.')
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('get-nonce')
  async getNonce(@Ip() ip: string, @Body() getNonceDto: GetNonceDto) {
    if (!this.isPrivateNetworkRequest(ip)) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const message = await this.authService.getNonceMessage(
      getNonceDto.walletAddress,
    );

    return {
      message,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('get-token')
  async getToken(
    @Ip() ip: string,
    @Body()
    {
      walletAddress,
      message,
      signedMessage,
      username,
      initialBalance,
    }: GetTokenDto,
  ) {
    if (!this.isPrivateNetworkRequest(ip)) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    return await this.authService.getToken(
      walletAddress,
      message,
      signedMessage,
      username,
      initialBalance,
    );
  }
}
