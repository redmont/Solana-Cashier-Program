import { Module } from '@nestjs/common';
import { Gateway } from './gateway';
import { JwtAuthModule } from '@/jwtAuth/jwtAuth.module';
import { StreamTokensModule } from '@/streamToken/streamToken.module';
import { AuthModule } from '@/auth/auth.module';
import { StreamAuthModule } from '@/streamAuth/streamAuth.module';
import { ChatAuthModule } from '@/chatAuth/chatAuth.module';

@Module({
  imports: [
    AuthModule,
    JwtAuthModule,
    StreamTokensModule,
    StreamAuthModule,
    ChatAuthModule,
  ],
  providers: [Gateway],
  exports: [Gateway],
})
export class GatewayModule {}
