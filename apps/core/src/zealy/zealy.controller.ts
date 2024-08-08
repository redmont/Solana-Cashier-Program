import { NatsJetStreamContext } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import { ZealyQuestCompletedEvent, ZealyService } from './zealy.service';

@Controller()
export class ZealyController {
  constructor(private readonly service: ZealyService) {}

  @EventPattern('zealy.questCompletedEvent')
  public async handleQuestCompletedEvent(
    @Payload() data: ZealyQuestCompletedEvent,
    @Ctx() ctx: NatsJetStreamContext,
  ) {
    await this.service.processEvent(data);

    ctx.message.ack();
  }
}
