import { Inject, Logger, OnModuleInit, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ClientProxy } from '@nestjs/microservices';
import { Server } from 'socket.io';
import { sendBrokerMessage } from 'broker-comms';
import {
  PlaceBetMessage as PlaceBetUiGatewayMessage,
  GetBalanceMessage as GetBalanceUiGatewayMessage,
  GetActivityStreamMessage as GetActivityStreamUiGatewayMessage,
  GetMatchStatusMessage,
  GetLeaderboardMessage,
  GatewayEvent,
  GetRosterMessage,
  GetMatchHistoryMessage,
  GetUserMatchHistoryMessage,
  GetMatchHistoryMessageResponse,
  GetUserMatchHistoryMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import {
  PlaceBetMessage,
  GetBalanceMessage,
  GetBalanceMessageResponse,
  PlaceBetMessageResponse,
} from 'core-messages';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { Socket } from './websocket/socket';
import { QueryStoreService } from 'query-store';
import { IJwtAuthService } from './jwtAuth/jwtAuth.interface';
import { ConfigService } from '@nestjs/config';
import { ReadModelService } from 'cashier-read-model';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger: Logger = new Logger(AppGateway.name);
  private readonly mediaUri: string;

  @WebSocketServer()
  server: Server;

  private instanceId: string;
  private clientUserIdMap: Map<string, string> = new Map();

  constructor(
    private readonly configService: ConfigService,
    @Inject('BROKER') private readonly broker: ClientProxy,
    private readonly query: QueryStoreService,
    @Inject('JWT_AUTH_SERVICE')
    private readonly jwtAuthService: IJwtAuthService,
    private readonly cashierReadModelService: ReadModelService,
  ) {
    this.mediaUri = this.configService.get<string>('mediaUri');
  }

  onModuleInit() {
    this.instanceId = this.configService.get<string>('instanceId');
  }

  getMediaUrl(path: string) {
    return `${this.mediaUri}/${path}`;
  }

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
        .catch((error) => {});

      if (tokenValid) {
        const decodedToken = this.jwtAuthService.decode(token);

        const userId = decodedToken.sub;

        this.clientUserIdMap.set(client.id, userId);

        this.broker.emit('gateway.userConnected', {
          userId,
          instanceId: this.instanceId,
        });

        client.join(`user-${userId}`);
      }
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.clientUserIdMap.get(client.id);

    if (userId) {
      this.broker.emit('gateway.userDisconnected', {
        userId,
        instanceId: this.instanceId,
      });

      this.clientUserIdMap.delete(client.id);
    }
  }

  @SubscribeMessage(GetMatchStatusMessage.messageType)
  public async getMatchStatus() {
    const {
      matchId,
      seriesCodeName,
      fighters,
      state,
      bets,
      startTime,
      winner,
      preMatchVideoPath,
    } = await this.query.getCurrentMatch();

    const preMatchVideoUrl =
      preMatchVideoPath?.length > 0 ? this.getMediaUrl(preMatchVideoPath) : '';

    return {
      matchId,
      series: seriesCodeName,
      fighters: fighters.map(({ imagePath, ...rest }) => ({
        ...rest,
        imageUrl: this.getMediaUrl(imagePath),
      })),
      state,
      preMatchVideoUrl,
      bets,
      startTime,
      winner,
      success: true,
    };
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

    if (amount <= 0) {
      return {
        success: false,
        error: { message: 'Amount must be greater than 0' },
      };
    }

    try {
      const { success, message } = await sendBrokerMessage<
        PlaceBetMessage,
        PlaceBetMessageResponse
      >(
        this.broker,
        new PlaceBetMessage(series, userId, walletAddress, amount, fighter),
      );

      const error = message ? { message } : null;

      return { success, error };
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

  @SubscribeMessage(GetActivityStreamUiGatewayMessage.messageType)
  public async getActivityStream(
    @MessageBody() data: GetActivityStreamUiGatewayMessage,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.clientUserIdMap.get(client.id);

    const activityStream = await this.query.getActivityStream(
      data.series,
      data.matchId,
      userId ?? undefined,
    );

    return {
      success: true,
      messages: activityStream.map((item) => ({
        timestamp: item.sk,
        message: item.message,
      })),
    };
  }

  @SubscribeMessage(GetLeaderboardMessage.messageType)
  public async getLeaderboard(
    @MessageBody() { pageSize, page, searchQuery }: GetLeaderboardMessage,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.clientUserIdMap.get(client?.id);

    const { totalCount, items, currentUserItem } =
      await this.cashierReadModelService.getLeaderboard(
        pageSize,
        page,
        userId,
        searchQuery,
      );

    return {
      success: true,
      totalCount,
      items,
      currentUserItem,
    };
  }

  @SubscribeMessage(GetRosterMessage.messageType)
  public async getRoster() {
    const { roster } = await this.query.getRoster();

    return {
      success: true,
      roster: roster.map(({ codeName }) => ({ series: codeName })),
    };
  }

  @SubscribeMessage(GetMatchHistoryMessage.messageType)
  public async getMatchHistory(): Promise<GetMatchHistoryMessageResponse> {
    const result = await this.query.getMatches();

    const matches = result.map((match) => ({
      ...match,
      fighters: match.fighters.map((fighter) => ({
        ...fighter,
        imageUrl: this.getMediaUrl(fighter.imagePath),
      })),
    }));

    return {
      success: true,
      matches,
    };
  }

  @SubscribeMessage(GetUserMatchHistoryMessage.messageType)
  public async getUserMatchHistory(
    @ConnectedSocket() client: Socket,
  ): Promise<GetUserMatchHistoryMessageResponse> {
    const userId = this.clientUserIdMap.get(client?.id);

    const result = await this.query.getUserMatches(userId);

    const matches = result.map((match) => ({
      ...match,
      fighters: match.fighters.map((fighter) => ({
        ...fighter,
        imageUrl: this.getMediaUrl(fighter.imagePath),
      })),
    }));

    return {
      success: true,
      matches,
    };
  }

  public publish<T extends GatewayEvent>(data: T) {
    const messageType = (data.constructor as any).messageType;

    this.logger.verbose(`Emitting message of type ${messageType}`);

    this.server.emit(messageType, data);
  }

  public publishToUser<T extends GatewayEvent>(userId: string, data: T) {
    const messageType = (data.constructor as any).messageType;

    this.logger.verbose(
      `Emitting message of type '${messageType}' to user '${userId}'`,
    );

    this.server.to(`user-${userId}`).emit(messageType, data);
  }
}
