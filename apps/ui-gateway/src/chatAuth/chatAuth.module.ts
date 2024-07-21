import { Module } from '@nestjs/common';
import { ChatAuthService } from './chatAuth.service';

@Module({
  providers: [ChatAuthService],
  exports: [ChatAuthService],
})
export class ChatAuthModule {}
