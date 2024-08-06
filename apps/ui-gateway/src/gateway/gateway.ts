import { Inject, Logger, OnModuleInit, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { instrument } from '@socket.io/admin-ui';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Server } from 'socket.io';
import { sendBrokerCommand } from 'broker-comms';
import {
  PlaceBetMessage as PlaceBetUiGatewayMessage,
  GetBalanceMessage as GetBalanceUiGatewayMessage,
  GetBalanceMessageResponse as GetBalanceUiGatewayMessageResponse,
  GetActivityStreamMessage as GetActivityStreamUiGatewayMessage,
  GetMatchStatusMessage,
  GatewayEvent,
  GetRosterMessage,
  GetMatchHistoryMessage,
  GetUserMatchHistoryMessage,
  GetMatchHistoryMessageResponse,
  GetUserMatchHistoryMessageResponse,
  GetTournamentMessage,
  GetTournamentMessageResponse,
  GetUserIdMessageResponse,
  GetUserIdMessage,
  GetStreamTokenMessage,
  GetStreamTokenMessageResponse,
  GetMatchStatusMessageResponse,
  GetStreamAuthTokenMessage,
  GetStreamAuthTokenMessageResponse,
  GetDailyClaimsMessage,
  GetDailyClaimsMessageResponse,
  ClaimDailyClaimMessage as ClaimDailyClaimUiGatewayMessage,
  ClaimDailyClaimMessageResponse as ClaimDailyClaimUiGatewayMessageResponse,
  ChatAuthMessage,
  ChatAuthMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import {
  PlaceBetMessage,
  PlaceBetMessageResponse,
  EnsureUserIdMessage,
  EnsureUserIdMessageReturnType,
  ClaimDailyClaimMessage,
  ClaimDailyClaimMessageResponse,
} from 'core-messages';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { Socket } from './websocket/socket';
import {
  QueryStoreService,
  UserProfilesQueryStoreService,
  TournamentQueryStoreService,
} from 'query-store';
import { IJwtAuthService } from '@/jwtAuth/jwtAuth.interface';
import { ConfigService } from '@nestjs/config';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import dayjs from '@/dayjs';
import { StreamTokenService } from '@/streamToken/streamToken.service';
import { emitInternalEvent, UserConnectedEvent } from '@/internalEvents';
import { StreamAuthService } from '@/streamAuth/streamAuth.service';
import { ChatAuthService } from '@/chatAuth/chatAuth.service';
import { GatewayService } from './gateway.service';

@WebSocketGateway()
export class Gateway
  implements
    OnModuleInit,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect
{
  private readonly logger: Logger = new Logger(Gateway.name);
  private readonly mediaUri: string;

  @WebSocketServer()
  server: Server;

  private instanceId: string;
  private clientUserIdMap: Map<string, string> = new Map();

  constructor(
    private readonly gatewayService: GatewayService,
    private readonly configService: ConfigService,
    private readonly broker: NatsJetStreamClientProxy,
    private readonly query: QueryStoreService,
    @Inject('JWT_AUTH_SERVICE')
    private readonly jwtAuthService: IJwtAuthService,
    private readonly streamTokenService: StreamTokenService,
    private readonly streamAuthService: StreamAuthService,
    private readonly eventEmitter: EventEmitter2,
    private readonly chatAuthService: ChatAuthService,
    private readonly tournamentQueryStore: TournamentQueryStoreService,
    private readonly userProfilesQueryStore: UserProfilesQueryStoreService,
  ) {
    this.mediaUri = this.configService.get<string>('mediaUri');
  }

  afterInit() {
    instrument(this.server, {
      auth: false,
      mode: 'development',
    });
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
          const { username } = decodedToken;
          const { address } = decodedToken.verified_credentials[0];

          const { userId } = await sendBrokerCommand<
            EnsureUserIdMessage,
            EnsureUserIdMessageReturnType
          >(this.broker, new EnsureUserIdMessage(address));

          await this.userProfilesQueryStore.setUserProfile(userId, {
            username,
            primaryWalletAddress: address,
          });

          client.data.authorizedUser = {
            userId,
            walletAddress: address,
            username,
          };
        } else {
          const userId = decodedToken.sub;
          const walletAddress = decodedToken.claims.walletAddress;

          await this.userProfilesQueryStore.setUserProfile(userId, {
            username: '',
            primaryWalletAddress: walletAddress,
          });

          // Token from our own auth service
          client.data.authorizedUser = {
            userId,
            walletAddress,
            username: '', // todo
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

    emitInternalEvent(this.eventEmitter, UserConnectedEvent, {
      clientId: client.id,
    });
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
  public async getMatchStatus(): Promise<GetMatchStatusMessageResponse> {
    const {
      matchId,
      seriesCodeName,
      fighters,
      state,
      bets,
      poolOpenStartTime,
      startTime,
      winner,
      preMatchVideoPath,
      streamId,
      lastUpdated,
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
      streamId,
      bets,
      poolOpenStartTime,
      startTime,
      winner,
      timestamp: lastUpdated,
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
      const { success, message } = await sendBrokerCommand<
        PlaceBetMessage,
        PlaceBetMessageResponse
      >(
        this.broker,
        new PlaceBetMessage(series, userId, walletAddress, amount, fighter),
      );

      const error = message ? { message } : null;

      return { success, error };
    } catch (e) {
      return { success: false, error: { message: e.message } };
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage(GetBalanceUiGatewayMessage.messageType)
  public async getBalance(
    @ConnectedSocket() client: Socket,
  ): Promise<GetBalanceUiGatewayMessageResponse> {
    const { userId } = client.data.authorizedUser;

    const balance = await this.gatewayService.getBalance(userId);

    return { balance, success: true };
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

  @SubscribeMessage(GetRosterMessage.messageType)
  public async getRoster() {
    const { roster } = await this.query.getRoster();

    return {
      success: true,
      roster: roster.map(({ codeName, fighters }) => ({
        series: codeName,
        fighters: fighters.map(({ imagePath, ...rest }) => ({
          ...rest,
          imageUrl: this.getMediaUrl(imagePath),
        })),
      })),
    };
  }

  @SubscribeMessage(GetMatchHistoryMessage.messageType)
  public async getMatchHistory(
    @MessageBody() { fighterCodeNames }: GetMatchHistoryMessage,
  ): Promise<GetMatchHistoryMessageResponse> {
    const result = await this.query.getMatchHistory(fighterCodeNames);

    const matches = result.map((match) => ({
      ...match,
      fighters: match.fighters.map(({ imagePath, ...rest }) => ({
        ...rest,
        imageUrl: this.getMediaUrl(imagePath),
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
    @MessageBody()
    { sortBy, pageSize, page, searchQuery }: GetTournamentMessage,
    @ConnectedSocket() client: Socket,
  ): Promise<GetTournamentMessageResponse> {
    const userId = this.clientUserIdMap.get(client?.id);

    const now = dayjs.utc().toISOString();

    const {
      displayName,
      description,
      startDate,
      endDate,
      currentRound,
      prizes,
      totalCount,
      items,
      currentUserItem,
    } = await this.tournamentQueryStore.getCurrentTournamentLeaderboard(
      now,
      sortBy,
      pageSize,
      page,
      userId,
      searchQuery,
    );

    let roundEndDate = null;
    if (startDate) {
      roundEndDate = dayjs
        .utc(startDate)
        .add(currentRound ?? 1, 'day')
        .toISOString();
    }

    return {
      success: true,
      displayName,
      description,
      startDate,
      endDate,
      currentRound,
      roundEndDate,
      prizes,
      totalCount,
      items,
      currentUserItem,
    };
  }

  @SubscribeMessage(GetUserIdMessage.messageType)
  public async getUserId(
    @ConnectedSocket() client: Socket,
  ): Promise<GetUserIdMessageResponse> {
    const userId = this.clientUserIdMap.get(client.id);

    return {
      success: true,
      userId,
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

  @SubscribeMessage(GetStreamAuthTokenMessage.messageType)
  public async getAuthStreamToken(
    @ConnectedSocket() client: Socket,
  ): Promise<GetStreamAuthTokenMessageResponse> {
    const token = this.streamAuthService.generateToken(client.id);

    return {
      success: true,
      token,
    };
  }

  @SubscribeMessage(GetDailyClaimsMessage.messageType)
  public async getDailyClaims(
    @ConnectedSocket() client: Socket,
  ): Promise<GetDailyClaimsMessageResponse> {
    const userId = this.clientUserIdMap.get(client?.id);

    const {
      dailyClaimAmounts,
      dailyClaimStreak,
      nextClaimDate,
      claimExpiryDate,
    } = await this.query.getDailyClaims(userId);

    return {
      success: true,
      dailyClaimAmounts,
      streak: dailyClaimStreak,
      nextClaimDate,
      claimExpiryDate,
    };
  }

  @SubscribeMessage(ClaimDailyClaimUiGatewayMessage.messageType)
  public async claimDailyClaim(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: ClaimDailyClaimUiGatewayMessage,
  ): Promise<ClaimDailyClaimUiGatewayMessageResponse> {
    const userId = this.clientUserIdMap.get(client?.id);

    if (!userId) {
      return {
        success: false,
        message: 'User not authorized',
      };
    }

    const result = await sendBrokerCommand<
      ClaimDailyClaimMessage,
      ClaimDailyClaimMessageResponse
    >(this.broker, new ClaimDailyClaimMessage(userId, body.amount));
    if (!result.success) {
      return {
        success: false,
        message: result.message,
      };
    }

    const { streak, nextClaimDate, claimExpiryDate } = result.data;

    return {
      success: true,
      data: {
        streak,
        nextClaimDate,
        claimExpiryDate,
      },
    };
  }

  @SubscribeMessage(ChatAuthMessage.messageType)
  public async chatAuth(
    @ConnectedSocket() client: Socket,
  ): Promise<ChatAuthMessageResponse> {
    const userId = this.clientUserIdMap.get(client?.id);
    const username = client?.data.authorizedUser?.username;

    const { token, authorizedUuid, channels } =
      await this.chatAuthService.getAuthToken(userId, username);

    return {
      success: true,
      token,
      authorizedUuid,
      channels,
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

  public publishToClient<T extends GatewayEvent>(clientId: string, data: T) {
    const messageType = (data.constructor as any).messageType;

    this.logger.verbose(
      `Emitting message of type '${messageType}' to client '${clientId}'`,
    );

    // Get the socket instance for the client
    const client = this.server.sockets.sockets.get(clientId);
    if (client) {
      client.emit(messageType, data);
    }
  }
}
