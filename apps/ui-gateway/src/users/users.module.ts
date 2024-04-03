import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ConfigService } from "@nestjs/config";
import { DynamooseModule } from "nestjs-dynamoose";
import { UserSchema, UserWalletSchema } from "./users.schema";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { config } from "src/config";

@Module({
  imports: [
    DynamooseModule.forFeatureAsync([
      {
        name: "user",
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: UserSchema,
            options: {
              tableName: configService.get<string>("TABLE_NAME"),
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
    DynamooseModule.forFeatureAsync([
      {
        name: "userWallet",
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: UserWalletSchema,
            options: {
              tableName: configService.get<string>("TABLE_NAME"),
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
    ClientsModule.register([
      {
        name: "BROKER_REDIS",
        transport: Transport.REDIS,
        options: {
          host: config.redisHost,
          port: parseInt(config.redisPort),
        },
      },
    ]),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
