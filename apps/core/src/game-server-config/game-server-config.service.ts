import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { GameServerConfig } from './game-server-config.interface';
import { Key } from 'query-store/dist/interfaces/key.interface';

@Injectable()
export class GameServerConfigService {
  constructor(
    @InjectModel('gameServerConfig')
    private readonly gameServerConfig: Model<GameServerConfig, Key>,
  ) {}

  async create(serverId: string, streamUrl: string) {
    await this.gameServerConfig.create({
      pk: 'gameServerConfig',
      sk: serverId,
      streamUrl,
    });
  }

  async get(serverId: string) {
    return await this.gameServerConfig.get({
      pk: 'gameServerConfig',
      sk: serverId,
    });
  }

  async getAll() {
    const result = await this.gameServerConfig
      .query({ pk: 'gameServerConfig' })
      .exec();

    return result.map(({ pk, sk, ...rest }) => ({ ...rest, serverId: sk }));
  }
}
