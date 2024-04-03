import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { MatchModule } from "./match.module.js";
import { config } from "./config.js";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MatchModule,
    {
      transport: Transport.REDIS,
      options: {
        host: config.redisHost,
        port: parseInt(config.redisPort),
      },
    }
  );
  await app.listen();
}
bootstrap();
