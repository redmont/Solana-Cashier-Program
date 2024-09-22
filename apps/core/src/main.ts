import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { NatsJetStreamServer } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { AppModule } from './app.module';
import configuration from './configuration';
import { GameServerWsAdapter } from './gameServer/wsAdapter';
import { setupGracefulShutdown } from 'nestjs-graceful-shutdown';

async function bootstrap() {
  const config = configuration();

  const app = await NestFactory.create(AppModule, {
    cors: true,
    forceCloseConnections: true,
  });

  app.connectMicroservice<MicroserviceOptions>({
    strategy: new NatsJetStreamServer({
      connectionOptions: {
        servers: config.natsUri.split(','),
        name: 'core-listener',
        debug: true,
      },
      consumerOptions: {
        deliverGroup: 'core-group',
        durable: 'core-durable',
        deliverTo: 'core-messages',
        manualAck: true,
      },
      streamConfig: [
        {
          name: 'core',
          subjects: ['instanceEvent.*.core.*.*', 'core.*', 'core.*.*'],
        },
        {
          name: 'gateway',
          subjects: ['gateway.>'],
        },
        {
          name: 'zealy',
          subjects: ['zealy.*'],
        },
      ],
    }),
  });

  app.useWebSocketAdapter(new GameServerWsAdapter(app));

  setupGracefulShutdown({ app });

  await app.startAllMicroservices();
  await app.listen(config.gameServerWsPort, '0.0.0.0');
}
bootstrap();
