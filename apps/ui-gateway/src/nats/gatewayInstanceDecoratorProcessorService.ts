import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventPattern } from '@nestjs/microservices';

/**
 * This service allows us to dynamically subscribe to NATS subjects
 * based on the gateway ID.
 */
@Injectable()
export class GatewayInstanceDecoratorProcessorService {
  private readonly logger = new Logger(
    GatewayInstanceDecoratorProcessorService.name,
  );

  constructor(private readonly configService: ConfigService) {}

  processNatsDecorators(types: any[]) {
    for (const type of types) {
      const propNames = Object.getOwnPropertyNames(type.prototype);
      for (const prop of propNames) {
        const propValue = Reflect.getMetadata(
          'NATS_SUBJECT_METADATA',
          Reflect.get(type.prototype, prop),
        );

        if (propValue) {
          const instanceId = this.configService.get<string>('instanceId');
          const subject = `gateway.${instanceId}.${propValue}`;
          this.logger.log(
            `Setting subject ${subject} for ${type.name}#${prop}`,
          );
          Reflect.decorate(
            [EventPattern(subject)],
            type.prototype,
            prop,
            Reflect.getOwnPropertyDescriptor(type.prototype, prop),
          );
        }
      }
    }
  }
}
