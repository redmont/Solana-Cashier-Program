import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { GameServerConfig } from './gameServerConfig.interface';
import { Key } from '@/interfaces/key';

@Injectable()
export class GameServerConfigService {
  constructor(
    @InjectModel('gameServerConfig')
    private readonly gameServerConfig: Model<GameServerConfig, Key>,
  ) {}

  async create(serverId: string, streamId: string) {
    await this.gameServerConfig.create({
      pk: 'gameServerConfig',
      sk: serverId,
      streamId,
    });
  }

  async update(serverId: string, streamId: string) {
    await this.gameServerConfig.update(
      { pk: 'gameServerConfig', sk: serverId },
      { streamId },
    );
  }

  async get(serverId: string) {
    return await this.gameServerConfig.get({
      pk: 'gameServerConfig',
      sk: serverId,
    });
  }

  async getAll(): Promise<Omit<GameServerConfig, 'pk' | 'sk'>[]> {
    const result = await this.gameServerConfig
      .query({ pk: 'gameServerConfig' })
      .exec();

    return result.map(({ pk, sk, ...rest }) => ({ ...rest, serverId: sk }));
  }
}
