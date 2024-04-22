import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GameServerConfigService } from 'src/game-server-config/game-server-config.service';
import { SeriesService } from 'src/series/series.service';

interface CreateGameServerConfigRequest {
  codeName: string;
  streamUrl: string;
}

interface UpdateGameServerConfigRequest {
  streamUrl: string;
}

@Controller('admin')
export class AdminController {
  constructor(
    @Inject('BROKER') private broker: ClientProxy,
    private readonly seriesService: SeriesService,
    private readonly gameServerConfigService: GameServerConfigService,
  ) {}

  @Get('/series')
  async listSeries() {
    return { series: this.seriesService.listSeries() };
  }

  @Post('/series')
  async createSeries(@Body() body: { codeName: string; displayName: string }) {
    await this.seriesService.createSeries(body.codeName, body.displayName);
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
}
