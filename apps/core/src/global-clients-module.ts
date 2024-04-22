import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'BROKER',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
          return {
            transport: Transport.NATS,
            options: {
              servers: [configService.get<string>('natsUri')],
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class GlobalClientsModule {}
