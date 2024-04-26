import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { AccountModule } from './account/account.module';
import configuration from './configuration';

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
    AccountModule,
  ],
})
export class AppModule {}
