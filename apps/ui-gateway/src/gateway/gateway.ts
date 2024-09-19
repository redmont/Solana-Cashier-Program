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
  GetMatchStatusMessageResponse,
  GetStreamAuthTokenMessage,
  GetStreamAuthTokenMessageResponse,
  GetDailyClaimsMessage,
  GetDailyClaimsMessageResponse,
  ClaimDailyClaimMessage as ClaimDailyClaimUiGatewayMessage,
  ClaimDailyClaimMessageResponse as ClaimDailyClaimUiGatewayMessageResponse,
  ChatAuthMessage,
  ChatAuthMessageResponse,
  GetUserProfileMessage,
  GetUserProfileMessageResponse,
  RequestWithdrawalMessage as RequestWithdrawalUiGatewayMessage,
  RequestWithdrawalMessageResponse as RequestWithdrawalUiGatewayMessageResponse,
  GetWithdrawalsMessage as GetWithdrawalsUiGatewayMessage,
  GetWithdrawalsMessageResponse as GetWithdrawalsUiGatewayMessageResponse,
  MarkWithdrawalAsCompleteMessage as MarkWithdrawalAsCompleteUiGatewayMessage,
  GetFightersMessage,
  GetFightersMessageResponse,
  GetRosterMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import {
  PlaceBetMessage,
  PlaceBetMessageResponse,
  EnsureUserIdMessage,
  EnsureUserIdMessageReturnType,
  ClaimDailyClaimMessage,
  ClaimDailyClaimMessageResponse,
  RequestWithdrawalMessage,
  RequestWithdrawalMessageResponse,
  MarkWithdrawalAsCompleteMessage,
  MarkWithdrawalAsCompleteMessageResponse,
} from 'core-messages';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { Socket } from './websocket/socket';
import {
  QueryStoreService,
  UserProfilesQueryStoreService,
  TournamentQueryStoreService,
  FighterProfilesQueryStoreService,
} from 'query-store';
import { IJwtAuthService } from '@/jwtAuth/jwtAuth.interface';
import { ConfigService } from '@nestjs/config';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import dayjs from '@/dayjs';
import { emitInternalEvent, UserConnectedEvent } from '@/internalEvents';
import { StreamAuthService } from '@/streamAuth/streamAuth.service';
import { ChatAuthService } from '@/chatAuth/chatAuth.service';
import { GatewayService } from './gateway.service';
import { registerLead, updateLead } from '@/referral/firstPromoter';

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
    private readonly streamAuthService: StreamAuthService,
    private readonly eventEmitter: EventEmitter2,
    private readonly chatAuthService: ChatAuthService,
    private readonly tournamentQueryStore: TournamentQueryStoreService,
    private readonly userProfilesQueryStore: UserProfilesQueryStoreService,
    private readonly fighterProfilesQueryStore: FighterProfilesQueryStoreService,
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
          const { username, team = null, newUser } = decodedToken;
          const { address } = decodedToken.verified_credentials[0];
          const { userId } = await sendBrokerCommand<
            EnsureUserIdMessage,
            EnsureUserIdMessageReturnType
          >(this.broker, new EnsureUserIdMessage(address));

          const userStore =
            await this.userProfilesQueryStore.getUserProfile(userId);

          let canonicalTeam = userStore?.team ?? null;

          if (!userStore?.team && team) {
            try {
              const res = await registerLead({
                apiKey: this.configService.get<string>('fpApiKey'),
                uid: userId,
                ref_id: team,
                ip: ipAddress,
              });
              canonicalTeam = team;
            } catch (error) {
              this.logger.error(
                'Error signing up lead:',
                error.response?.data || error.message,
              );
            }
          } else if (userStore?.team !== team && team) {
            try {
              const res = await updateLead({
                apiKey: this.configService.get<string>('fpApiKey'),
                uid: userId,
                updates: { ref_id: team },
              });
              canonicalTeam = team;
            } catch (error) {
              this.logger.error(
                'Error updating lead:',
                error.response?.data || error.message,
              );
            }
          }

          const updateValues: Record<string, any> = {
            username,
            primaryWalletAddress: address,
          };
          if (canonicalTeam) {
            updateValues.team = canonicalTeam;
          }

          await this.userProfilesQueryStore.updateUserProfile(
            userId,
            updateValues,
          );

          client.data.authorizedUser = {
            userId,
            walletAddress: address,
            username,
          };
        } else {
          const userId = decodedToken.sub;
          const walletAddress = decodedToken.claims.walletAddress;
          const username = decodedToken.claims.username;

          await this.userProfilesQueryStore.updateUserProfile(userId, {
            username: username?.length > 0 ? username : '',
            primaryWalletAddress: walletAddress,
          });

          // Token from our own auth service
          client.data.authorizedUser = {
            userId,
            walletAddress,
            username,
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
    try {
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
        preMatchVideoPath?.length > 0
          ? this.getMediaUrl(preMatchVideoPath)
          : '';

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
    } catch (e) {
      this.logger.error('GetMatchStatus failed', e);
      return {
        matchId: null,
        series: null,
        fighters: [],
        state: null,
        preMatchVideoUrl: null,
        streamId: null,
        bets: [],
        poolOpenStartTime: null,
        startTime: null,
        winner: null,
        timestamp: null,
        success: false,
      };
    }
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

    const { success, message } = await sendBrokerCommand<
      PlaceBetMessage,
      PlaceBetMessageResponse
    >(
      this.broker,
      new PlaceBetMessage(series, userId, walletAddress, amount, fighter),
    );

    const error = message ? { message } : null;

    return { success, error };
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage(GetBalanceUiGatewayMessage.messageType)
  public async getBalance(
    @ConnectedSocket() client: Socket,
  ): Promise<GetBalanceUiGatewayMessageResponse> {
    const { userId } = client.data.authorizedUser;

    try {
      const balance = await this.gatewayService.getBalance(userId);
      return { balance, success: true };
    } catch (e) {
      this.logger.error('GetBalance failed', e);
      return {
        balance: 0,
        success: false,
        error: e.message,
      };
    }
  }

  @SubscribeMessage(GetActivityStreamUiGatewayMessage.messageType)
  public async getActivityStream(
    @MessageBody() data: GetActivityStreamUiGatewayMessage,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.clientUserIdMap.get(client.id);

    let messages = [];
    try {
      const activityStream = await this.query.getActivityStream(
        data.series,
        data.matchId,
        userId ?? undefined,
      );

      messages = activityStream.map((item) => ({
        timestamp: item.sk,
        message: item.message,
      }));
    } catch (e) {
      this.logger.error('GetActivityStream failed', e);
      return {
        success: false,
        error: e.message,
      };
    }

    return {
      success: true,
      messages,
    };
  }

  @SubscribeMessage(GetRosterMessage.messageType)
  public async getRoster(): Promise<GetRosterMessageResponse> {
    let rosterItems: {
      series: string;
      fighters: {
        displayName: string;
        imageUrl: string;
      }[];
    }[];

    try {
      const { roster } = await this.query.getRoster();
      rosterItems = roster.map(({ codeName, fighters }) => ({
        series: codeName,
        fighters: fighters.map(({ imagePath, ...rest }) => ({
          ...rest,
          imageUrl: this.getMediaUrl(imagePath),
        })),
      }));
    } catch (e) {
      this.logger.error('GetRoster failed', e);
      return {
        roster: [],
        success: false,
        error: e.message,
      };
    }

    return {
      success: true,
      roster: rosterItems,
    };
  }

  @SubscribeMessage(GetMatchHistoryMessage.messageType)
  public async getMatchHistory(
    @MessageBody() { fighterCodeNames }: GetMatchHistoryMessage,
  ): Promise<GetMatchHistoryMessageResponse> {
    try {
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
    } catch (e) {
      this.logger.error('GetMatchHistory failed', e);
      return {
        success: false,
        error: e.message,
        matches: [],
      };
    }
  }

  @SubscribeMessage(GetUserMatchHistoryMessage.messageType)
  public async getUserMatchHistory(
    @ConnectedSocket() client: Socket,
  ): Promise<GetUserMatchHistoryMessageResponse> {
    try {
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
    } catch (e) {
      this.logger.error('GetUserMatchHistory failed', e);
      return {
        success: false,
        error: e.message,
        matches: [],
      };
    }
  }

  @SubscribeMessage(GetTournamentMessage.messageType)
  public async getTournament(
    @MessageBody()
    { sortBy, pageSize, page, searchQuery }: GetTournamentMessage,
    @ConnectedSocket() client: Socket,
  ): Promise<GetTournamentMessageResponse> {
    try {
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

      const prizesWithImageUrls = prizes.map(
        ({ title, description, imagePath }) => ({
          title,
          description,
          imageUrl: imagePath ? this.getMediaUrl(imagePath) : null,
        }),
      );

      return {
        success: true,
        displayName,
        description,
        startDate,
        endDate,
        currentRound,
        roundEndDate,
        prizes: prizesWithImageUrls,
        totalCount,
        items,
        currentUserItem,
      };
    } catch (e) {
      this.logger.error('GetTournament failed', e);
      return {
        success: false,
        error: e.message,
        displayName: null,
        description: null,
        startDate: null,
        endDate: null,
        currentRound: null,
        roundEndDate: null,
        prizes: [],
        totalCount: 0,
        items: [],
      };
    }
  }

  @SubscribeMessage(GetUserIdMessage.messageType)
  public async getUserId(
    @ConnectedSocket() client: Socket,
  ): Promise<GetUserIdMessageResponse> {
    const userId = this.clientUserIdMap.get(client.id);

    return {
      success: !!userId,
      userId,
    };
  }

  @SubscribeMessage(GetStreamAuthTokenMessage.messageType)
  public async getAuthStreamToken(
    @ConnectedSocket() client: Socket,
  ): Promise<GetStreamAuthTokenMessageResponse> {
    try {
      const token = this.streamAuthService.generateToken(client.id);
      return {
        success: true,
        token,
      };
    } catch (e) {
      this.logger.error('GetStreamAuthToken failed', e);
      return {
        token: null,
        success: false,
        error: e.message,
      };
    }
  }

  @SubscribeMessage(GetDailyClaimsMessage.messageType)
  public async getDailyClaims(
    @ConnectedSocket() client: Socket,
  ): Promise<GetDailyClaimsMessageResponse> {
    const userId = this.clientUserIdMap.get(client?.id);

    try {
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
    } catch (e) {
      this.logger.error('GetDailyClaims failed', e);
      return {
        success: false,
        error: e.message,
        dailyClaimAmounts: [],
        streak: 0,
        nextClaimDate: null,
        claimExpiryDate: null,
      };
    }
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

    try {
      const { token, authorizedUuid, channels } =
        await this.chatAuthService.getAuthToken(userId, username);

      return {
        success: true,
        token,
        authorizedUuid,
        channels,
      };
    } catch (e) {
      this.logger.error('GetChatAuthToken failed', e);
      return {
        success: false,
        error: e.message,
        token: null,
        authorizedUuid: null,
        channels: [],
      };
    }
  }

  @SubscribeMessage(GetUserProfileMessage.messageType)
  public async getUserProfile(
    @ConnectedSocket() client: Socket,
  ): Promise<GetUserProfileMessageResponse> {
    if (!client.data.authorizedUser) {
      return {
        success: false,
        xp: 0,
        error: {
          message: 'User not authorized',
        },
      };
    }

    const { userId } = client.data.authorizedUser;

    try {
      const profile = await this.userProfilesQueryStore.getUserProfile(userId);

      return {
        success: true,
        xp: profile?.xp ?? 0,
      };
    } catch (e) {
      this.logger.error('GetUserProfile failed', e);
      return {
        success: false,
        error: e.message,
        xp: 0,
      };
    }
  }

  @SubscribeMessage(RequestWithdrawalUiGatewayMessage.messageType)
  public async requestWithdrawal(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    {
      chainId,
      tokenSymbol,
      walletAddress,
      creditAmount,
    }: RequestWithdrawalUiGatewayMessage,
  ): Promise<RequestWithdrawalUiGatewayMessageResponse> {
    const userId = client.data.authorizedUser?.userId;

    if (!userId) {
      return { success: false, error: { message: 'User not authorized' } };
    }

    if (!chainId.startsWith('eip155:')) {
      return {
        success: false,
        error: { message: 'Only Ethereum chains are supported' },
      };
    }

    if (tokenSymbol !== 'USDC') {
      return {
        success: false,
        error: { message: 'Only USDC withdrawals are supported' },
      };
    }

    const { success, message } = await sendBrokerCommand<
      RequestWithdrawalMessage,
      RequestWithdrawalMessageResponse
    >(
      this.broker,
      new RequestWithdrawalMessage(
        userId,
        chainId,
        tokenSymbol,
        walletAddress,
        creditAmount,
      ),
    );

    const error = message ? { message } : null;

    return { success, error };
  }

  @SubscribeMessage(GetWithdrawalsUiGatewayMessage.messageType)
  public async getWithdrawals(
    @ConnectedSocket() client: Socket,
  ): Promise<GetWithdrawalsUiGatewayMessageResponse> {
    const userId = client.data.authorizedUser?.userId;

    if (!userId) {
      return {
        success: false,
        withdrawals: [],
        error: { message: 'User not authorized' },
      };
    }

    try {
      const result = await this.gatewayService.getWithdrawals(userId);

      return { success: true, withdrawals: result as any };
    } catch (e) {
      this.logger.error('GetWithdrawals failed', e);
      return {
        success: false,
        error: e.message,
        withdrawals: [],
      };
    }
  }

  @SubscribeMessage(MarkWithdrawalAsCompleteUiGatewayMessage.messageType)
  async markWithdrawalAsComplete(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    { receiptId, transactionHash }: MarkWithdrawalAsCompleteUiGatewayMessage,
  ) {
    const userId = client.data.authorizedUser?.userId;

    if (!userId) {
      return { success: false, error: { message: 'User not authorized' } };
    }

    const { success } = await sendBrokerCommand<
      MarkWithdrawalAsCompleteMessage,
      MarkWithdrawalAsCompleteMessageResponse
    >(
      this.broker,
      new MarkWithdrawalAsCompleteMessage(userId, receiptId, transactionHash),
    );

    return { success };
  }

  @SubscribeMessage(GetFightersMessage.messageType)
  public async getFighterProfiles(): Promise<GetFightersMessageResponse> {
    try {
      const fighterProfiles =
        await this.fighterProfilesQueryStore.getFighterProfiles();

      const fighters = fighterProfiles
        .filter((fighter) => fighter.showOnRoster)
        .map((fighter) => ({
          ...fighter,
          imageUrl: this.getMediaUrl(fighter.imagePath),
        }));

      return {
        success: true,
        fighters,
      };
    } catch (e) {
      this.logger.error('GetFighters failed', e);
      return {
        success: false,
        error: e.message,
        fighters: [],
      };
    }
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
