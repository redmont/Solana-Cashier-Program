import {
  BadRequestException,
  Header,
  Put,
  StreamableFile,
} from '@nestjs/common';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
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
} from './models';
import { ConfigService } from '@nestjs/config';
import { TournamentService } from '@/tournament/tournament.service';
import { CreateTournamentRequest } from './models/createTournamentRequest';
import { UpdateTournamentRequest } from './models/updateTournamentRequest';

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
    @Inject('BROKER') private broker: ClientProxy,
  ) {
    this.mediaUri = this.configService.get<string>('mediaUri');
  }

  getMediaUrl(path: string) {
    return `${this.mediaUri}/${path}`;
  }

  @Get('/series')
  async listSeries() {
    return { series: this.seriesService.listSeries() };
  }

  @Get('/series/:codeName')
  async getSeries(@Param('codeName') codeName: string) {
    const series = await this.seriesService.getSeries(codeName);
    if (!series) {
      throw new BadRequestException('Series not found');
    }

    const fighters = series.fighters.map((fighter) => ({
      ...fighter,
      imageUrl: this.getMediaUrl(fighter.imagePath),
    }));

    return {
      ...series,
      fighters,
    };
  }

  @Post('/series')
  async createSeries(@Body() body: CreateSeriesRequest) {
    const {
      codeName,
      displayName,
      betPlacementTime,
      preMatchVideoPath,
      preMatchDelay,
      fighters,
      level,
      fightType,
    } = body;

    await this.seriesService.createSeries(
      codeName,
      displayName,
      betPlacementTime,
      preMatchVideoPath,
      preMatchDelay,
      fighters,
      level,
      fightType,
    );
  }

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
      fighters,
      level,
    } = body;
    return this.seriesService.updateSeries(
      codeName,
      displayName,
      betPlacementTime,
      preMatchVideoPath,
      preMatchDelay,
      fighters,
      level,
    );
  }

  @Post('/series/run')
  async runSeries(@Body() body: { codeName: string }) {
    this.seriesService.sendEvent(body.codeName, 'RUN');
  }

  @Get('/game-server-configs')
  async getGameServerConfigs() {
    return { serverConfigs: await this.gameServerConfigService.getAll() };
  }

  @Post('/game-server-configs')
  async createGameServerConfig(@Body() body: CreateGameServerConfigRequest) {
    await this.gameServerConfigService.create(body.codeName, body.streamUrl);
  }

  @Patch('/game-server-configs/:id')
  async updateGameServerConfig(
    @Param('id') id: string,
    @Body() body: UpdateGameServerConfigRequest,
  ) {}

  @Get('/game-server-capabilities')
  async getGameServerCapabilities() {
    return {
      capabilities: await this.gameServerCapabilitiesService.getCapabilities(),
    };
  }

  @Get('/points-balances')
  async getPointsBalance() {
    return await sendBrokerMessage<
      GetAllBalancesMessage,
      GetAllBalancesMessageResponse
    >(this.broker, new GetAllBalancesMessage());
  }

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

  @Post('/points-balances/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.adminService.processPointsBalancesUpload(file);
  }

  @Get('/roster')
  getRoster() {
    return this.rosterService.getRoster();
  }

  @Patch('/roster')
  updateRoster(@Body() body: UpdateRosterRequest) {
    return this.rosterService.updateRoster(
      body.scheduleType,
      body.schedule,
      body.series,
      body.timedSeries,
    );
  }

  @Get('/tournaments')
  async listTournaments() {
    return { tournaments: await this.tournamentService.getTournaments() };
  }

  @Post('/tournaments')
  createTournament(@Body() body: CreateTournamentRequest) {
    return this.tournamentService.createTournament(body);
  }

  @Get('/tournaments/:codeName')
  async getTournament(@Param('codeName') codeName: string) {
    return this.tournamentService.getTournament(codeName);
  }

  @Put('/tournaments/:codeName')
  updateTournament(
    @Param('codeName') codeName: string,
    @Body() body: UpdateTournamentRequest,
  ) {
    const { displayName, description, startDate, endDate, prizes } = body;
    return this.tournamentService.updateTournament({
      codeName,
      displayName,
      description,
      startDate,
      endDate,
      prizes,
    });
  }
}
