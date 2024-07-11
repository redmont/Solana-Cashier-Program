import {
  BadRequestException,
  Header,
  Put,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { FileInterceptor } from '@nestjs/platform-express';
import { sendBrokerMessage } from 'broker-comms';
import {
  GetAllBalancesMessage,
  GetAllBalancesMessageResponse,
} from 'cashier-messages';
import { GameServerConfigService } from '@/gameServerConfig/gameServerConfig.service';
import { SeriesService } from 'src/series/series.service';
import { AdminService } from './admin.service';
import { GameServerCapabilitiesService } from '@/gameServerCapabilities/gameServerCapabilities.service';
import { RosterService } from '@/roster/roster.service';
import {
  UpdateSeriesRequest,
  CreateSeriesRequest,
  CreateGameServerConfigRequest,
  UpdateGameServerConfigRequest,
  UpdateRosterRequest,
  CreateTournamentRequest,
  UpdateTournamentRequest,
} from './models';
import { ConfigService } from '@nestjs/config';
import { TournamentService } from '@/tournament/tournament.service';
import { AdminAuthGuard } from '@/auth/adminAuthGuard';
import { FighterProfilesService } from '@/fighterProfiles/fighterProfiles.service';
import { Tournament } from '@/tournament/interfaces/tournament.interface';

@Controller('admin')
export class AdminController {
  private readonly mediaUri: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly seriesService: SeriesService,
    private readonly gameServerConfigService: GameServerConfigService,
    private readonly adminService: AdminService,
    private readonly gameServerCapabilitiesService: GameServerCapabilitiesService,
    private readonly rosterService: RosterService,
    private readonly tournamentService: TournamentService,
    private readonly fighterProfilesService: FighterProfilesService,
    private readonly broker: NatsJetStreamClientProxy,
  ) {
    this.mediaUri = this.configService.get<string>('mediaUri');
  }

  getMediaUrl(path: string) {
    return `${this.mediaUri}/${path}`;
  }

  @UseGuards(AdminAuthGuard)
  @Get('/series')
  async listSeries() {
    return { series: this.seriesService.listSeries() };
  }

  @UseGuards(AdminAuthGuard)
  @Get('/series/:codeName')
  async getSeries(@Param('codeName') codeName: string) {
    const series = await this.seriesService.getSeries(codeName);
    if (!series) {
      throw new BadRequestException('Series not found');
    }

    return series;
  }

  @UseGuards(AdminAuthGuard)
  @Post('/series')
  async createSeries(@Body() body: CreateSeriesRequest) {
    const {
      codeName,
      displayName,
      betPlacementTime,
      preMatchVideoPath,
      preMatchDelay,
      fighterProfiles,
      level,
      fightType,
    } = body;

    await this.seriesService.createSeries(
      codeName,
      displayName,
      betPlacementTime,
      preMatchVideoPath,
      preMatchDelay,
      fighterProfiles,
      level,
      fightType,
    );
  }

  @UseGuards(AdminAuthGuard)
  @Put('/series/:codeName')
  updateSeries(
    @Param('codeName') codeName: string,
    @Body() body: UpdateSeriesRequest,
  ) {
    const {
      displayName,
      betPlacementTime,
      preMatchVideoPath,
      preMatchDelay,
      fighterProfiles,
      level,
    } = body;
    return this.seriesService.updateSeries(
      codeName,
      displayName,
      betPlacementTime,
      preMatchVideoPath,
      preMatchDelay,
      fighterProfiles,
      level,
    );
  }

  @UseGuards(AdminAuthGuard)
  @Get('/game-server-configs')
  async getGameServerConfigs() {
    return { serverConfigs: await this.gameServerConfigService.getAll() };
  }

  @UseGuards(AdminAuthGuard)
  @Post('/game-server-configs')
  async createGameServerConfig(@Body() body: CreateGameServerConfigRequest) {
    await this.gameServerConfigService.create(body.codeName, body.streamId);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('/game-server-configs/:id')
  async updateGameServerConfig(
    @Param('id') id: string,
    @Body() body: UpdateGameServerConfigRequest,
  ) {
    await this.gameServerConfigService.update(id, body.streamId);
  }

  @UseGuards(AdminAuthGuard)
  @Get('/game-server-capabilities')
  async getGameServerCapabilities() {
    return {
      capabilities: await this.gameServerCapabilitiesService.getCapabilities(),
    };
  }

  @UseGuards(AdminAuthGuard)
  @Get('/points-balances')
  async getPointsBalance() {
    return await sendBrokerMessage<
      GetAllBalancesMessage,
      GetAllBalancesMessageResponse
    >(this.broker, new GetAllBalancesMessage());
  }

  @UseGuards(AdminAuthGuard)
  @Get('/points-balances/download')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="balances.csv"')
  async downloadPointsBalances() {
    const response = await sendBrokerMessage<
      GetAllBalancesMessage,
      GetAllBalancesMessageResponse
    >(this.broker, new GetAllBalancesMessage());

    const items = response.accounts.map(
      (account) => `${account.primaryWalletAddress},${account.balance}`,
    );

    items.splice(0, 0, 'walletAddress,balance');

    const buffer = Buffer.from(items.join('\n'), 'utf-8');

    // Return as CSV download
    return new StreamableFile(buffer);
  }

  @UseGuards(AdminAuthGuard)
  @Post('/points-balances/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.adminService.processPointsBalancesUpload(file);
  }

  @UseGuards(AdminAuthGuard)
  @Get('/roster')
  getRoster() {
    return this.rosterService.getRoster();
  }

  @UseGuards(AdminAuthGuard)
  @Patch('/roster')
  updateRoster(@Body() body: UpdateRosterRequest) {
    return this.rosterService.updateRoster(
      body.scheduleType,
      body.schedule,
      body.series,
      body.timedSeries,
    );
  }

  @UseGuards(AdminAuthGuard)
  @Get('/tournaments')
  async listTournaments(): Promise<{
    tournaments: Omit<Tournament, 'pk' | 'sk'>[];
  }> {
    const tournamentsResult = await this.tournamentService.getTournaments();

    return { tournaments: tournamentsResult };
  }

  @UseGuards(AdminAuthGuard)
  @Post('/tournaments')
  createTournament(@Body() body: CreateTournamentRequest) {
    return this.tournamentService.createTournament(body);
  }

  @UseGuards(AdminAuthGuard)
  @Get('/tournaments/:codeName')
  async getTournament(@Param('codeName') codeName: string) {
    return this.tournamentService.getTournament(codeName);
  }

  @UseGuards(AdminAuthGuard)
  @Put('/tournaments/:codeName')
  updateTournament(
    @Param('codeName') codeName: string,
    @Body() body: UpdateTournamentRequest,
  ) {
    const {
      displayName,
      description,
      startDate,
      rounds,
      currentRound,
      prizes,
    } = body;
    return this.tournamentService.updateTournament(codeName, {
      displayName,
      description,
      startDate,
      currentRound,
      rounds,
      prizes,
    });
  }

  @UseGuards(AdminAuthGuard)
  @Get('/fighter-profiles')
  async listFighterProfiles() {
    return {
      fighterProfiles: await this.fighterProfilesService.list(),
    };
  }

  @UseGuards(AdminAuthGuard)
  @Get('/fighter-profiles/:codeName')
  async getFighterProfile(@Param('codeName') codeName: string) {
    const fighterProfile = await this.fighterProfilesService.get(codeName);

    return {
      ...fighterProfile,
      imageUrl: this.getMediaUrl(fighterProfile.imagePath),
    };
  }

  @UseGuards(AdminAuthGuard)
  @Post('/fighter-profiles')
  async createFighterProfile(@Body() body: any) {
    return this.fighterProfilesService.create(body);
  }

  @UseGuards(AdminAuthGuard)
  @Put('/fighter-profiles/:codeName')
  async updateFighterProfile(
    @Param('codeName') codeName: string,
    @Body() body: any,
  ) {
    return this.fighterProfilesService.update(codeName, body);
  }
}
