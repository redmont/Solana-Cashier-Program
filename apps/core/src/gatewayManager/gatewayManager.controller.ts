import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import { NatsJetStreamContext } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { GatewayManagerService } from './gatewayManager.service';
import { BalanceUpdatedEvent as CashierBalanceUpdatedEvent } from 'cashier-messages';

@Controller()
export class GatewayManagerController {
  constructor(private readonly gatewayManagerService: GatewayManagerService) {}

  @EventPattern(CashierBalanceUpdatedEvent.messageType)
  async handleBalanceUpdated(
    @Ctx() ctx: NatsJetStreamContext,
    @Payload() { timestamp, userId, balance }: CashierBalanceUpdatedEvent,
  ) {
    this.gatewayManagerService.handleBalanceUpdated(timestamp, userId, balance);

    ctx.message.ack();
  }

  @EventPattern('gateway.userConnected')
  async handleUserConnected(
    @Ctx() ctx: NatsJetStreamContext,
    @Payload() data: { userId: string; instanceId: string },
  ) {
    this.gatewayManagerService.handleUserConnected(
      data.userId,
      data.instanceId,
    );

    ctx.message.ack();
  }

  @EventPattern('gateway.userDisconnected')
  async handleUserDisconnected(
    @Ctx() ctx: NatsJetStreamContext,
    @Payload() data: { userId: string; instanceId: string },
  ) {
    this.gatewayManagerService.handleUserDisconnected(
      data.userId,
      data.instanceId,
    );

    ctx.message.ack();
  }
}
