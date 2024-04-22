import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { GlobalClientsModule } from './global-clients-module';
import { SeriesModule } from './series/series.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RedisCacheModule } from 'global-cache';
import { QueryStoreModule } from 'query-store';
import configuration from './configuration';
import { GameServerModule } from './game-server/game-server.module';
import { UsersModule } from './users/users.module';
import { GatewayManagerModule } from './gateway-manager/gateway-manager.module';
import { AdminModule } from './admin/admin.module';

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
      useFactory: (configService: ConfigService) => {
        return {
          tableName: configService.get<string>('queryStoreTableName'),
          isDynamoDbLocal: configService.get<boolean>('isDynamoDbLocal'),
        };
      },
      inject: [ConfigService],
    }),
    GlobalClientsModule,
    GatewayManagerModule,
    SeriesModule,
    GameServerModule,
    {
      global: true,
      module: QueryStoreModule,
    },
    UsersModule,
    AdminModule,
  ],
})
export class AppModule {}
