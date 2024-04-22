import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { sendBrokerMessage } from 'broker-comms';
import { RegisterGatewayInstanceMessage } from 'core-messages';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private instanceId: string;
  private timer: NodeJS.Timeout;

  constructor(
    private readonly configService: ConfigService,
    @Inject('BROKER') private readonly broker: ClientProxy,
  ) {}

  onModuleInit() {
    this.instanceId = this.configService.get<string>('instanceId');

    this.startDiscovery();
  }

  onModuleDestroy() {
    clearInterval(this.timer);
  }

  private startDiscovery() {
    this.timer = setInterval(() => {
      // Call sendBrokerMessage until a successful response is received
      let success = false;
      let attempts = 0;
      const maxAttempts = 5;
      const delay = 5000;
      const send = async () => {
        if (success) {
          return;
        }
        if (attempts >= maxAttempts) {
          throw new Error(
            `Failed to register instance in ${maxAttempts} attempts`,
          );
        }
        attempts++;
        try {
          await sendBrokerMessage(
            this.broker,
            new RegisterGatewayInstanceMessage(this.instanceId),
          );
          success = true;
        } catch (error) {
          console.error(`Failed to send message: ${error.message}`);
          setTimeout(send, delay);
        }
      };

      send();

      console.log('Successfully registered instance');
    }, 1000 * 10);
  }
}
