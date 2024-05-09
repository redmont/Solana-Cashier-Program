import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import configuration from './configuration';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './websocket/redisIoAdapter';

async function bootstrap() {
  const config = configuration();

  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  const redisIoAdapter = new RedisIoAdapter(app.getHttpServer(), {
    host: config.redisHost,
    port: config.redisPort,
  });
  await redisIoAdapter.connectToRedis();

  app.useWebSocketAdapter(redisIoAdapter);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [config.natsUri],
      debug: true,
      queue: config.instanceId,
      waitOnFirstConnect: true,
    },
  });

  await app.startAllMicroservices();
  await app.listen(config.websocketPort, '0.0.0.0');
}

bootstrap();
