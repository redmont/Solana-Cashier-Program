import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DynamooseModule } from "nestjs-dynamoose";
import { AccountModule } from "./account/account.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DynamooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          local: configService.get<boolean>("IS_DDB_LOCAL")
            ? "http://localhost:8765"
            : false,
        };
      },
      inject: [ConfigService],
    }),
    AccountModule,
  ],
})
export class AppModule {}
