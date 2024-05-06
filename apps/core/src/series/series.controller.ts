import { Controller, Inject } from '@nestjs/common';
import {
  ClientProxy,
  MessagePattern,
  Payload,
  RpcException,
} from '@nestjs/microservices';
import {
  PlaceBetMessage,
  MatchCompletedMessage,
  GetBalanceMessage,
  GameServerDisconnectedMessage,
} from 'core-messages';
import {
  GetBalanceMessage as CashierGetBalanceMessage,
  GetBalanceMessageResponse as CashierGetBalanceMessageResponse,
} from 'cashier-messages';
import { sendBrokerMessage } from 'broker-comms';
import { OnEvent } from '@nestjs/event-emitter';
import { SeriesService } from './series.service';

@Controller()
export class SeriesController {
  constructor(
    private readonly seriesService: SeriesService,
    @Inject('BROKER') private readonly broker: ClientProxy,
  ) {}

  @MessagePattern(PlaceBetMessage.messageType)
  async handleBetPlaced(@Payload() data: PlaceBetMessage) {
    try {
      const success = await this.seriesService.placeBet(
        data.seriesCodeName,
        data.userId,
        data.walletAddress,
        data.amount,
        data.fighter,
      );

      return { success };
    } catch (e) {
      throw new RpcException(e.message);
    }
  }

  @OnEvent(MatchCompletedMessage.messageType)
  async handleMatchCompleted(data: MatchCompletedMessage) {
    this.seriesService.matchCompleted(data.matchId);

    return { success: true };
  }

  @OnEvent(GameServerDisconnectedMessage.messageType)
  async handleGameServerDisconnected(data: GameServerDisconnectedMessage) {
    this.seriesService.gameServerDisconnected(data.matchId);

    return { success: true };
  }

  @MessagePattern(GetBalanceMessage.messageType)
  async handleGetBalance(@Payload() data: any) {
    const result = await sendBrokerMessage<
      CashierGetBalanceMessage,
      CashierGetBalanceMessageResponse
    >(this.broker, new CashierGetBalanceMessage(data.userId));

    return { balance: result.balance, success: result.success };
  }
}
