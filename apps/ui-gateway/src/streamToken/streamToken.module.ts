import { Module } from '@nestjs/common';
import { StreamTokenService } from './streamToken.service';
import { ConfigService } from '@nestjs/config';
import { NonceSchema } from './streamToken.schema';
import { DynamooseModule } from 'nestjs-dynamoose';

@Module({
  imports: [
    DynamooseModule.forFeatureAsync([
      {
        name: 'streamToken',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: NonceSchema,
            options: {
              tableName: configService.get<string>('tableName'),
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [StreamTokenService],
  exports: [StreamTokenService],
})
export class StreamTokensModule {}
