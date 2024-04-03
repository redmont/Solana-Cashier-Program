import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { KmsJwtAuthService } from "./kms-jwt-auth.service";
import { TestJwtAuthService } from "./test-jwt-auth.service";
import { JWT_AUTH_SERVICE } from "./jwt-auth.constants";
import { JwtAuthGuard } from "../jwt-auth.guard";

@Module({
  providers: [
    {
      provide: JWT_AUTH_SERVICE,
      useFactory: (configService: ConfigService) => {
        const useTestAuthService = configService.get<boolean>(
          "USE_TEST_AUTH_SERVICE"
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
