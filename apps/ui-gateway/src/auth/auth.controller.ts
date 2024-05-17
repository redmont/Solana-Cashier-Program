import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

export class GetNonceDto {
  walletAddress: string;
}

export class GetTokenDto {
  walletAddress: string;
  message: string;
  signedMessage: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('get-nonce')
  async getNonce(@Body() getNonceDto: GetNonceDto) {
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
    @Body() { walletAddress, message, signedMessage }: GetTokenDto,
  ) {
    return await this.authService.getToken(
      walletAddress,
      message,
      signedMessage,
    );
  }
}
