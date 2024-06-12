import { Module } from '@nestjs/common';
import { AdminAuthGuard } from './adminAuthGuard';

@Module({
  providers: [AdminAuthGuard],
  exports: [AdminAuthGuard],
})
export class AuthModule {}
