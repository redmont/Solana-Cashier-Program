import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { GlobalClientsModule } from "src/global-clients-module";
import { DynamooseModule } from "nestjs-dynamoose";
import { ConfigService } from "@nestjs/config";
import { UserSchema, UserWalletSchema } from "./users.schema";

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
              create: configService.get<boolean>("IS_DDB_LOCAL"),
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
              create: configService.get<boolean>("IS_DDB_LOCAL"),
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
    GlobalClientsModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
