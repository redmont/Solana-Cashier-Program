import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { RedisCacheModule } from 'global-cache';
import { QueryStoreModule } from 'query-store';
import { ReadModelModule } from 'cashier-read-model';
import { AppGateway } from './app.gateway';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { JwtAuthModule } from './jwtAuth/jwtAuth.module';
import { GlobalClientsModule } from './globalClientsModule';
import configuration from './configuration';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { StreamTokensModule } from './streamToken/streamToken.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    RedisCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          host: configService.get<string>('redisHost'),
          port: parseInt(configService.get<string>('redisPort')),
        };
      },
      inject: [ConfigService],
    }),
    DynamooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          local: configService.get<boolean>('isDynamoDbLocal')
            ? 'http://localhost:8765'
            : false,
        };
      },
      inject: [ConfigService],
    }),
    QueryStoreModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          tableName: configService.get<string>('queryStoreTableName'),
          isDynamoDbLocal: configService.get<boolean>('isDynamoDbLocal'),
        };
      },
      inject: [ConfigService],
    }),
    ReadModelModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          tableName: configService.get<string>('cashierReadModelTableName'),
        };
      },
      inject: [ConfigService],
    }),
    GlobalClientsModule,
    AuthModule,
    JwtAuthModule,
    StreamTokensModule,
  ],
  providers: [AppService, AppGateway, JwtAuthGuard],
  controllers: [AppController],
})
export class AppModule {}
