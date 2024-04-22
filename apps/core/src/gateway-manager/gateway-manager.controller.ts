import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import {
  RegisterGatewayInstanceMessage,
  SubscribeToSeriesMessage,
} from 'core-messages';
import { GatewayManagerService } from './gateway-manager.service';
import { BalanceUpdatedEvent as CashierBalanceUpdatedEvent } from 'cashier-messages';
import { BalanceUpdatedEvent } from 'core-messages';
import { DateTime } from 'luxon';

@Controller()
export class GatewayManagerController {
  private readonly subscriptions = {};

  constructor(private readonly gatewayManagerService: GatewayManagerService) {}

  @EventPattern(RegisterGatewayInstanceMessage.messageType)
  async handleInstanceStarted(data: { instanceId: string }) {
    const { instanceId } = data;

    this.gatewayManagerService.registerInstance(instanceId);

    return { success: true };
  }

  @EventPattern(SubscribeToSeriesMessage.messageType)
  async handleSubscribeToSeries(data: {
    seriesCodeName: string;
    clientId: string;
  }) {
    this.subscriptions[data.clientId] = data.seriesCodeName;
    return { success: true };
  }

  @EventPattern(CashierBalanceUpdatedEvent.messageType)
  async handleBalanceUpdated(data: CashierBalanceUpdatedEvent) {
    this.gatewayManagerService.handleBalanceUpdated(data.userId, data.balance);
  }
}
