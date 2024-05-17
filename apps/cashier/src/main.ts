import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import configuration from './configuration';

async function bootstrap() {
  const config = configuration();

  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [config.natsUri],
      debug: true,
      waitOnFirstConnect: true,
    },
  });

  await app.startAllMicroservices();
  await app.init();
}

bootstrap();
