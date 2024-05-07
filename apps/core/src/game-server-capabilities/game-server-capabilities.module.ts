import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { GameServerCapabilitiesSchema } from './game-server-capabilities.schema';
import { GameServerCapabilitiesService } from './game-server-capabilities.service';

@Module({
  imports: [
    DynamooseModule.forFeatureAsync([
      {
        name: 'gameServerCapabilities',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: GameServerCapabilitiesSchema,
            options: {
              tableName: configService.get<string>('tableName'),
              create: configService.get<boolean>('isDynamoDbLocal'),
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [GameServerCapabilitiesService],
  exports: [GameServerCapabilitiesService],
})
export class GameServerCapabilitiesModule {}
