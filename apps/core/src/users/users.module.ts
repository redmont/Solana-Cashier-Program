import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { GlobalClientsModule } from '@/globalClientsModule';
import { UserSchema, UserWalletSchema } from './users.schema';
import { UsersController } from './users.controller';

@Module({
  imports: [
    DynamooseModule.forFeatureAsync([
      {
        name: 'user',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: UserSchema,
            options: {
              tableName: configService.get<string>('tableName'),
              create: configService.get<boolean>('isDynamoDbLocal'),
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
    DynamooseModule.forFeatureAsync([
      {
        name: 'userWallet',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: UserWalletSchema,
            options: {
              tableName: configService.get<string>('tableName'),
              create: configService.get<boolean>('isDynamoDbLocal'),
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
    GlobalClientsModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
