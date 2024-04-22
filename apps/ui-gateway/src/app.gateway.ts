import { Inject, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { ClientProxy } from '@nestjs/microservices';
import { Server } from 'socket.io';
import { sendBrokerMessage } from 'broker-comms';
import {
  PlaceBetMessage as PlaceBetUiGatewayMessage,
  GetBalanceMessage as GetBalanceUiGatewayMessage,
  GetStatusMessage as GetStatusUiGatewayMessage,
  GetMatchStatusMessage,
  GatewayEvent,
} from 'ui-gateway-messages';
import {
  GetSeriesMessage,
  PlaceBetMessage,
  GetBalanceMessage,
  GetBalanceMessageResponse,
  PlaceBetMessageResponse,
  GetSeriesMessageResponse,
  SubscribeToSeriesMessage,
  SubscribeToSeriesResponse,
} from 'core-messages';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Socket } from './websocket/socket';
import { QueryStoreService } from 'query-store';
import { IJwtAuthService } from './jwt-auth/jwt-auth.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject('BROKER') private readonly broker: ClientProxy,
    private readonly query: QueryStoreService,
    @Inject('JWT_AUTH_SERVICE')
    private readonly jwtAuthService: IJwtAuthService,
  ) {}

  @UseGuards(JwtAuthGuard)
  handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.auth?.token;
    if (token) {
      const tokenValid = this.jwtAuthService
        .verify(token)
        .then((decodedToken) => {
          client.data.authorizedUser = decodedToken;
          return true;
        })
        .catch((error) => {
          throw new WsException(error.message);
        });

      if (tokenValid) {
        const decodedToken = this.jwtAuthService.decode(token);
      }
    }
  }

  handleDisconnect(client: Socket) {}

  @SubscribeMessage(GetMatchStatusMessage.messageType)
  public async status(
    @MessageBody() data: GetMatchStatusMessage,
    @ConnectedSocket() client: Socket,
  ) {
    console.log("got 'get match status' msg");
    const { series } = data;
    //const x = await this.queryService.getMatchStatus();

    //console.log('Cache response', x);

    await sendBrokerMessage<
      SubscribeToSeriesMessage,
      SubscribeToSeriesResponse
    >(this.broker, new SubscribeToSeriesMessage(series, client.id));

    const { state, bets } = await this.query.getSeries(series);

    return { state, bets, success: true };
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage(PlaceBetUiGatewayMessage.messageType)
  public async placeBet(
    @MessageBody() data: { series: string; amount: number; fighter: string },
    @ConnectedSocket()
    client: Socket,
  ) {
    const { series, amount, fighter } = data;

    const userId = client.data.authorizedUser.sub;
    const walletAddress = client.data.authorizedUser.claims.walletAddress;

    try {
      const result = await sendBrokerMessage<
        PlaceBetMessage,
        PlaceBetMessageResponse
      >(
        this.broker,
        new PlaceBetMessage(series, userId, walletAddress, amount, fighter),
      );

      return { ...result, success: true };
    } catch (e) {
      console.log('Place bet error', JSON.stringify(e));
      return { success: false, error: { message: e.message } };
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage(GetBalanceUiGatewayMessage.messageType)
  public async getBalance(@ConnectedSocket() client: Socket) {
    const accountId = client.data.authorizedUser.sub;
    const result = await sendBrokerMessage<
      GetBalanceMessage,
      GetBalanceMessageResponse
    >(this.broker, new GetBalanceMessage(accountId));

    return { ...result, success: true };
  }

  public publish<T extends GatewayEvent>(data: T) {
    const messageType = (data.constructor as any).messageType;

    console.log('Emitting message of type', messageType);

    this.server.emit(messageType, data);
  }
}
