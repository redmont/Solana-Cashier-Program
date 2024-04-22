import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import configuration from './configuration';
import { GameServerWsAdapter } from './game-server/ws-adapter';

async function bootstrap() {
  const config = configuration();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [config.natsUri],
      debug: true,
      waitOnFirstConnect: true,
    },
  });

  app.useWebSocketAdapter(new GameServerWsAdapter(app));

  await app.startAllMicroservices();
  await app.listen(config.gameServerWsPort, '0.0.0.0');

  // const config = configuration();

  // const app = await NestFactory.create(AppModule);

  // const ms = app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.REDIS,
  //   options: {
  //     host: config.redisHost,
  //     port: config.redisPort,
  //   },
  // });

  // //

  // await app.startAllMicroservices();
  // //await app.listen(config.gameServerWsPort);
  // await app.listen(80);
}
bootstrap();
