import { Module } from "@nestjs/common";
import { MatchController } from "./match.controller.js";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { MatchService } from "./match.service.js";
import { config } from "./config.js";

@Module({
  imports: [
    MatchModule,
    ClientsModule.register([
      {
        name: "UI_CLIENTS_REDIS",
        transport: Transport.REDIS,
        options: {
          host: config.redisHost,
          port: parseInt(config.redisPort),
        },
      },
    ]),
  ],
  controllers: [MatchController],
  providers: [MatchService],
})
export class MatchModule {}
