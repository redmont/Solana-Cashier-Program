import { Header, Put, StreamableFile } from '@nestjs/common';
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
import { GameServerConfigService } from 'src/game-server-config/game-server-config.service';
import { SeriesService } from 'src/series/series.service';
import { AdminService } from './admin.service';
import { GameServerCapabilitiesService } from '@/game-server-capabilities/game-server-capabilities.service';
import { RosterService } from '@/roster/roster.service';

interface CreateGameServerConfigRequest {
  codeName: string;
  streamUrl: string;
}

interface UpdateGameServerConfigRequest {
  streamUrl: string;
}

interface CreateSeriesRequest {
  codeName: string;
  displayName: string;
  betPlacementTime: number;
  fighters: {
    codeName: string;
    displayName: string;
    ticker: string;
    model: {
      head: string;
      torso: string;
      legs: string;
    };
  }[];
  level: string;
}

interface UpdateRosterRequest {
  scheduleType: string;
  series: string[];
}

@Controller('admin')
export class AdminController {
  constructor(
    @Inject('BROKER') private broker: ClientProxy,
    private readonly seriesService: SeriesService,
    private readonly gameServerConfigService: GameServerConfigService,
    private readonly adminService: AdminService,
    private readonly gameServerCapabilitiesService: GameServerCapabilitiesService,
    private readonly rosterService: RosterService,
  ) {}

  @Get('/series')
  async listSeries() {
    return { series: this.seriesService.listSeries() };
  }

  @Post('/series')
  async createSeries(@Body() body: CreateSeriesRequest) {
    const { codeName, displayName, betPlacementTime, fighters, level } = body;

    await this.seriesService.createSeries(
      codeName,
      displayName,
      betPlacementTime,
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

  @Put('/roster')
  updateRoster(@Body() body: UpdateRosterRequest) {
    return this.rosterService.updateRoster(body.scheduleType, body.series);
  }
}
