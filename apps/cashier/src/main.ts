import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import configuration from './configuration';
import { NatsJetStreamServer } from '@nestjs-plugins/nestjs-nats-jetstream-transport';

async function bootstrap() {
  const config = configuration();

  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    strategy: new NatsJetStreamServer({
      connectionOptions: {
        servers: config.natsUri,
        name: 'cashier-listener',
        debug: true,
      },
      consumerOptions: {
        deliverGroup: 'cashier-group',
        durable: 'cashier-durable',
        deliverTo: 'cashier-messages',
        manualAck: true,
      },
      streamConfig: {
        name: 'cashier',
        subjects: ['cashier.*', 'cashier.*.*'],
      },
    }),
  });

  await app.startAllMicroservices();
  await app.init();
}

bootstrap();
