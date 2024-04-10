import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DynamooseModule } from "nestjs-dynamoose";
import { AppGateway } from "./app.gateway";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { config } from "./config";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { JwtAuthModule } from "./jwt-auth/jwt-auth.module";
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
    AuthModule,
    JwtAuthModule,
  ],
  providers: [AppGateway, AppService, JwtAuthGuard],
  controllers: [AppController],
})
export class AppModule {}
