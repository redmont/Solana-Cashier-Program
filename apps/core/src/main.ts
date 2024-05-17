import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import configuration from './configuration';
import { GameServerWsAdapter } from './gameServer/wsAdapter';

async function bootstrap() {
  const config = configuration();

  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

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
}
bootstrap();
