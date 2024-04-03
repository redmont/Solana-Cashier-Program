import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";
import { config } from "./config";
import { CustomWsAdapter } from "./ws-adapter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new CustomWsAdapter(app));

  // Redis microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: config.redisHost,
      port: parseInt(config.redisPort),
    },
  });

  await app.startAllMicroservices();
  await app.listen(config.websocketPort);
}

bootstrap();
