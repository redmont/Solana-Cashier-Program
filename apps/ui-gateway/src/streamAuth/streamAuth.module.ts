import { Module } from '@nestjs/common';
import { StreamAuthController } from './streamAuth.controller';
import { StreamAuthService } from './streamAuth.service';

@Module({
  controllers: [StreamAuthController],
  providers: [StreamAuthService],
  exports: [StreamAuthService],
})
export class StreamAuthModule {}
