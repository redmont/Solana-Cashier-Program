import { Module } from '@nestjs/common';
import { DailyClaimService } from './dailyClaim.service';
import { DailyClaimController } from './dailyClaim.controller';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigService } from '@nestjs/config';
import { DailyClaimAmountsSchema } from './schemas/dailyClaimAmounts.schema';
import { DailyClaimStatusSchema } from './schemas/dailyClaimStatus.schema';

@Module({
  imports: [
    DynamooseModule.forFeatureAsync([
      {
        name: 'dailyClaimAmounts',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: DailyClaimAmountsSchema,
            options: {
              tableName: configService.get<string>('tableName'),
              create: configService.get<boolean>('isDynamoDbLocal'),
            },
          };
        },
        inject: [ConfigService],
      },
      {
        name: 'dailyClaimStatus',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: DailyClaimStatusSchema,
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
  providers: [DailyClaimService],
  controllers: [DailyClaimController],
  exports: [DailyClaimService],
})
export class DailyClaimModule {}
