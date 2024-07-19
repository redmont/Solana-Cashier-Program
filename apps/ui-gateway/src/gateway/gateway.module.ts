import { Module, Query } from '@nestjs/common';
import { Gateway } from './gateway';
import { JwtAuthModule } from '@/jwtAuth/jwtAuth.module';
import { StreamTokensModule } from '@/streamToken/streamToken.module';
import { AuthModule } from '@/auth/auth.module';
import { StreamAuthModule } from '@/streamAuth/streamAuth.module';
import { ChatAuthModule } from '@/chatAuth/chatAuth.module';
import { QueryStoreModule } from 'query-store';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    JwtAuthModule,
    StreamTokensModule,
    StreamAuthModule,
    ChatAuthModule,
    QueryStoreModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          local: configService.get<boolean>('isDynamoDbLocal')
            ? 'http://localhost:8765'
            : false,
          tableName: configService.get<string>('queryStoreTableName'),
          isDynamoDbLocal: configService.get<boolean>('isDynamoDbLocal'),
          redisHost: configService.get<string>('redisHost'),
          redisPort: parseInt(configService.get<string>('redisPort')),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [Gateway],
  exports: [Gateway],
})
export class GatewayModule {}
