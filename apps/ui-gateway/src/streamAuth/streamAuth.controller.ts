import { Controller, Post, Req } from '@nestjs/common';
import { ValidateCredentialsRequest } from './models/validateCredentialsRequest';
import { StreamAuthService } from './streamAuth.service';
import { ValidateCredentialsResponse } from './models/validateCredentialsResponse';

@Controller('streamAuth')
export class StreamAuthController {
  constructor(private readonly streamAuthService: StreamAuthService) {}

  @Post('validateCredentials')
  async validateCredentials(
    @Req() request: ValidateCredentialsRequest,
  ): Promise<ValidateCredentialsResponse> {
    const { username, token } = request;
    const result = this.streamAuthService.validateToken(username, token);
    return { result };
  }
}
