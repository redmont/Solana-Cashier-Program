import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";
import { config } from "./config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Redis microservice
  const microserviceRedis = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: config.redisHost,
      port: parseInt(config.redisPort),
    },
  });

  await app.startAllMicroservices();
  await app.listen(80);
}

bootstrap();
