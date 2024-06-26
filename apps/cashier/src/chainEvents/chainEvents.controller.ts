import { NatsJetStreamContext } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import { ChainEvent, ChainEventsService } from './chainEvents.service';

@Controller()
export class ChainEventsController {
  constructor(private readonly service: ChainEventsService) {}

  @EventPattern('cashier.chainEvent')
  public async handleDepositEvent(
    @Payload() data: ChainEvent,
    @Ctx() ctx: NatsJetStreamContext,
  ) {
    await this.service.processEvent(data);

    ctx.message.ack();
  }
}
