import { Module, OnModuleInit } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DynamooseModule } from "nestjs-dynamoose";
import { MatchModule } from "./match/match.module";
import { GlobalClientsModule } from "./global-clients-module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env.local"] }),
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
    GlobalClientsModule,
    MatchModule,
  ],
})
export class AppModule {}
