import { Module } from '@nestjs/common';
import { GameServerConfigService } from './game-server-config.service';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigService } from '@nestjs/config';
import { GameServerConfigSchema } from './game-server-config.schema';

@Module({
  imports: [
    DynamooseModule.forFeatureAsync([
      {
        name: 'gameServerConfig',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: GameServerConfigSchema,
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
  providers: [GameServerConfigService],
  exports: [GameServerConfigService],
})
export class GameServerConfigModule {}
