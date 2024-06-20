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
  GetTournamentMessage,
  GetTournamentMessageResponse,
  GetStreamTokenMessage,
  GetStreamTokenMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import {
  PlaceBetMessage,
  GetBalanceMessage,
  GetBalanceMessageResponse,
  PlaceBetMessageResponse,
  EnsureUserIdMessage,
  EnsureUserIdMessageReturnType,
} from 'core-messages';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { Socket } from './websocket/socket';
import { QueryStoreService } from 'query-store';
import { IJwtAuthService } from './jwtAuth/jwtAuth.interface';
import { ConfigService } from '@nestjs/config';
import { ReadModelService } from 'cashier-read-model';
import dayjs from './dayjs';
import { StreamTokenService } from './streamToken/streamToken.service';

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
    private readonly streamTokenService: StreamTokenService,
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
  async handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(
      `Number of clients connected: ${this.server.engine.clientsCount}`,
    );

    const ipAddress = client.handshake.headers['x-forwarded-for'] as string;
    client.data.ipAddress = ipAddress;

    const token = client.handshake.auth?.token;
    if (token) {
      // Token is optional, and is only provided by authenticated users
      try {
        const decodedToken = await this.jwtAuthService.verify(token);

        if (
          decodedToken.verified_credentials &&
          decodedToken.verified_credentials.length > 0
        ) {
          // Token from dynamic.xyz
          const { address } = decodedToken.verified_credentials[0];

          const { userId } = await sendBrokerMessage<
            EnsureUserIdMessage,
            EnsureUserIdMessageReturnType
          >(this.broker, new EnsureUserIdMessage(address));

          client.data.authorizedUser = {
            userId,
            walletAddress: address,
          };
        } else {
          // Token from our own auth service
          client.data.authorizedUser = {
            userId: decodedToken.sub,
            walletAddress: decodedToken.claims.walletAddress,
          };
        }

        this.clientUserIdMap.set(client.id, client.data.authorizedUser.userId);

        this.broker.emit('gateway.userConnected', {
          userId: client.data.authorizedUser.userId,
          instanceId: this.instanceId,
        });

        client.join(`user-${client.data.authorizedUser.userId}`);
      } catch (error) {
        // Token is invalid (authentication failed)
        console.log('Error verifying token', error);
      }
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(
      `Number of clients connected: ${this.server.engine.clientsCount}`,
    );

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

    const { userId, walletAddress } = client.data.authorizedUser;

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
    const { userId } = client.data.authorizedUser;
    const result = await sendBrokerMessage<
      GetBalanceMessage,
      GetBalanceMessageResponse
    >(this.broker, new GetBalanceMessage(userId));

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

  @SubscribeMessage(GetTournamentMessage.messageType)
  public async getTournament(
    @MessageBody() { pageSize, page, searchQuery }: GetTournamentMessage,
    @ConnectedSocket() client: Socket,
  ): Promise<GetTournamentMessageResponse> {
    const userId = this.clientUserIdMap.get(client?.id);

    const now = dayjs.utc().toISOString();

    const {
      displayName,
      description,
      startDate,
      endDate,
      prizes,
      totalCount,
      items,
      currentUserItem,
    } = await this.query.getCurrentTournamentLeaderboard(
      now,
      pageSize,
      page,
      userId,
      searchQuery,
    );

    return {
      success: true,
      displayName,
      description,
      startDate,
      endDate,
      prizes,
      totalCount,
      items,
      currentUserItem,
    };
  }

  @SubscribeMessage(GetStreamTokenMessage.messageType)
  public async getStreamToken(
    @ConnectedSocket() client: Socket,
  ): Promise<GetStreamTokenMessageResponse> {
    const userId = this.clientUserIdMap.get(client?.id);

    if (!userId) {
      return {
        success: false,
        token: null,
      };
    }

    const token = await this.streamTokenService.getToken(
      userId,
      client.data.ipAddress,
    );

    return {
      success: true,
      token,
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
