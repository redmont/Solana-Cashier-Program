import { Module } from '@nestjs/common';
import { ActivityStreamService } from './activity-stream.service';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigService } from '@nestjs/config';
import { ActivityStreamItemSchema } from './activity-stream-item.schema';
import { GatewayManagerModule } from 'src/gateway-manager/gateway-manager.module';

@Module({
  imports: [
    DynamooseModule.forFeatureAsync([
      {
        name: 'activityStreamItem',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: ActivityStreamItemSchema,
            options: {
              tableName: configService.get<string>('tableName'),
              create: configService.get<boolean>('isDynamoDbLocal'),
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
    GatewayManagerModule,
  ],
  providers: [ActivityStreamService],
  exports: [ActivityStreamService],
})
export class ActivityStreamModule {}
