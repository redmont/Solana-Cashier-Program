import { Global, Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { config } from "./config";

@Global()
@Module({
  imports: [
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
  exports: [ClientsModule],
})
export class GlobalClientsModule {}
