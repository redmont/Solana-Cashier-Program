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
    PriceFeedModule,
    GatewayModule,
    StreamAuthModule,
  ],
  providers: [GatewayInstanceDecoratorProcessorService],
  controllers: [AppController],
})
export class AppModule {}
