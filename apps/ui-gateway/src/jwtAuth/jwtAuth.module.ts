import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KmsJwtAuthService } from './kmsJwtAuth.service';
import { TestJwtAuthService } from './testJwtAuth.service';
import { JWT_AUTH_SERVICE } from './jwtAuth.constants';
import { JwtAuthGuard } from '../guards/jwtAuth.guard';

@Module({
  providers: [
    {
      provide: JWT_AUTH_SERVICE,
      useFactory: (configService: ConfigService) => {
        const useTestAuthService = configService.get<boolean>(
          'USE_TEST_AUTH_SERVICE',
        );
        return useTestAuthService
          ? new TestJwtAuthService()
          : new KmsJwtAuthService();
      },
      inject: [ConfigService],
    },
    JwtAuthGuard,
  ],
  exports: [JWT_AUTH_SERVICE],
})
export class JwtAuthModule {}
