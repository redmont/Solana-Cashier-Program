import { NatsJetStreamTransport } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    NatsJetStreamTransport.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          connectionOptions: {
            servers: [configService.get<string>('natsUri')],
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [NatsJetStreamTransport],
})
export class GlobalClientsModule {}
