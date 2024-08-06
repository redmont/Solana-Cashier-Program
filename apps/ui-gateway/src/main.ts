import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { NatsJetStreamServer } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import configuration from './configuration';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './gateway/websocket/redisIoAdapter';
import { nanos } from 'nats';
import { GatewayInstanceDecoratorProcessorService } from './nats/gatewayInstanceDecoratorProcessorService';
import { AppController } from './app.controller';

async function bootstrap() {
  const config = configuration();

  const app = await NestFactory.create(AppModule, {
    cors: true,
    abortOnError: !!process.env.DEV_MODE,
  });

  app
    .get(GatewayInstanceDecoratorProcessorService)
    .processNatsDecorators([AppController]);

  const redisIoAdapter = new RedisIoAdapter(
    app.getHttpServer(),
    {
      host: config.redisHost,
      port: config.redisPort,
    },
    config.corsOrigins,
  );
  await redisIoAdapter.connectToRedis();

  app.useWebSocketAdapter(redisIoAdapter);

  app.connectMicroservice<MicroserviceOptions>({
    strategy: new NatsJetStreamServer({
      connectionOptions: {
        servers: config.natsUri.split(','),
        name: 'gateway-listener',
        debug: true,
      },
      consumerOptions: {
        deliverGroup: 'gateway-group',
        durable: 'gateway-durable',
        deliverTo: 'gateway-messages',
        manualAck: true,
      },
      streamConfig: [
        {
          name: 'gateway',
          subjects: ['gateway.>'],
        },
      ],
    }),
  });

  app.enableShutdownHooks();

  await app.startAllMicroservices();
  await app.listen(config.websocketPort, '0.0.0.0');
}

bootstrap();
