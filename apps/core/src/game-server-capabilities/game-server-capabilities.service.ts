import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { GameServerCapabilities } from './game-server-capabilities.interface';
import { Key } from '@/interfaces/key';

@Injectable()
export class GameServerCapabilitiesService implements OnModuleInit {
  key: Key = {
    pk: 'gameServerCapabilities',
    sk: 'gameServerCapabilities',
  };

  constructor(
    @InjectModel('gameServerCapabilities')
    private readonly model: Model<GameServerCapabilities, Key>,
  ) {}

  async onModuleInit() {
    const capabilities = await this.model.get(this.key);
    if (!capabilities) {
      await this.model.create({
        pk: 'gameServerCapabilities',
        sk: 'gameServerCapabilities',
        headModels: undefined,
        torsoModels: undefined,
        legModels: undefined,
        finishingMoves: undefined,
        levels: undefined,
      });
    }
  }

  async register(
    headModels: string[],
    torsoModels: string[],
    legModels: string[],
    finishingMoves: string[],
    levels: string[],
  ) {
    await this.model.update(this.key, {
      $ADD: {
        headModels,
        torsoModels,
        legModels,
        finishingMoves,
        levels,
      },
    });
  }

  async getCapabilities() {
    const capabilities = await this.model.get(this.key);

    // Weird thing: https://github.com/dynamoose/dynamoose/issues/1404
    return {
      headModels: Array.from(capabilities.headModels),
      torsoModels: Array.from(capabilities.torsoModels),
      legModels: Array.from(capabilities.legModels),
      finishingMoves: Array.from(capabilities.finishingMoves),
      levels: Array.from(capabilities.levels),
    };
  }
}
