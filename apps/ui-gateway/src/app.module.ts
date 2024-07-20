import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DynamooseModule } from 'nestjs-dynamoose';
import { RedisCacheModule } from 'global-cache';
import { QueryStoreModule } from 'query-store';
import { ReadModelModule } from 'cashier-read-model';
import { GlobalClientsModule } from './globalClientsModule';
import configuration from './configuration';
import { AppController } from './app.controller';
import { PriceFeedModule } from './priceFeed/priceFeed.module';
import { GatewayModule } from './gateway';
import { GatewayInstanceDecoratorProcessorService } from './nats/gatewayInstanceDecoratorProcessorService';
import { StreamAuthModule } from './streamAuth/streamAuth.module';
import { ChatAuthModule } from './chatAuth/chatAuth.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    EventEmitterModule.forRoot(),
    RedisCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          redisHost: configService.get<string>('redisHost'),
          redisPort: parseInt(configService.get<string>('redisPort')),
        };
      },
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          store: 'redis',
          host: configService.get<string>('redisHost'),
          port: parseInt(configService.get<string>('redisPort')),
          isGlobal: true,
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
          redisHost: configService.get<string>('redisHost'),
          redisPort: parseInt(configService.get<string>('redisPort')),
        };
      },
      inject: [ConfigService],
    }),
    ReadModelModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          tableName: configService.get<string>('cashierReadModelTableName'),
          redisHost: configService.get<string>('redisHost'),
          redisPort: parseInt(configService.get<string>('redisPort')),
        };
      },
      inject: [ConfigService],
    }),
    GlobalClientsModule,
    PriceFeedModule,
    GatewayModule,
    StreamAuthModule,
    ChatAuthModule,
  ],
  providers: [GatewayInstanceDecoratorProcessorService],
  controllers: [AppController],
})
export class AppModule {}
