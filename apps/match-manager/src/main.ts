import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { config } from "./config";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
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
