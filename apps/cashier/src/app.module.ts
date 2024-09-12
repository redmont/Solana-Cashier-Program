import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { AccountModule } from './account/account.module';
import configuration from './configuration';
import { ChainEventsModule } from './chainEvents/chainEvents.module';
import { WithdrawalModule } from './withdrawal/withdrawal.module';
import { GlobalClientsModule } from './globalClientsModule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
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
    GlobalClientsModule,
    AccountModule,
    WithdrawalModule,
    ChainEventsModule,
  ],
})
export class AppModule {}
