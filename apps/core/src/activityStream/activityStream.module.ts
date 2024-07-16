import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigService } from '@nestjs/config';
import { ActivityStreamService } from './activityStream.service';
import { ActivityStreamItemSchema } from './activityStreamItem.schema';
import { GatewayManagerModule } from '@/gatewayManager/gatewayManager.module';
import { ChatModule } from '@/chat/chat.module';

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
    ChatModule,
  ],
  providers: [ActivityStreamService],
  exports: [ActivityStreamService],
})
export class ActivityStreamModule {}
