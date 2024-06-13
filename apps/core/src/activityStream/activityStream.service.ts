import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { QueryStoreService } from 'query-store';
import { Dayjs } from 'dayjs';
import { ActivityStreamItem } from './interfaces/activityStreamItem.interface';
import { Key } from 'src/interfaces/key';
import { GatewayManagerService } from '@/gatewayManager/gatewayManager.service';

export type Activity = 'betPlaced' | 'win' | 'loss';

const pascalCase = (str: string) =>
  str.replace(/(\w)(\w*)/g, (_, g1, g2) => g1.toUpperCase() + g2.toLowerCase());
const pluralise = (amount: string, singular: string, plural: string) =>
  amount === '1' ? singular : plural;

@Injectable()
export class ActivityStreamService {
  constructor(
    @InjectModel('activityStreamItem')
    private readonly activityStreamItemModel: Model<ActivityStreamItem, Key>,
    private readonly queryStore: QueryStoreService,
    private readonly gatewayManager: GatewayManagerService,
  ) {}

  private generateMessage(activity: Activity, data: any) {
    switch (activity) {
      case 'betPlaced':
        return `Stake confirmed: ${data.amount} ${pluralise(data.amount, 'credit', 'credits')} on ${pascalCase(data.fighter)}.`;
      case 'win': {
        return `${data.winningFighter} wins! You won ${data.amount} ${pluralise(data.amount, 'credit', 'credits')}! Check the leaderboard to see your latest rank.`;
      }
      case 'loss': {
        if (data.winningFighter) {
          return `${data.winningFighter} wins! Better luck next time.`;
        } else {
          return `Draw! Better luck next time.`;
        }
      }

      default:
        return '';
    }
  }

  async track(
    seriesCodeName: string,
    matchId: string,
    timestamp: Dayjs,
    activity: Activity,
    data: any,
    userId?: string,
  ) {
    let pk = `activityStream#${matchId}`;
    if (userId) {
      pk += `#${userId}`;
    }
    const sk = timestamp.toJSON();

    await this.activityStreamItemModel.create({
      pk,
      sk,
      activity,
      data,
    });

    const message = this.generateMessage(activity, data);

    await this.queryStore.createActivityStreamItem(
      seriesCodeName,
      sk,
      matchId,
      message,
      userId,
    );

    this.gatewayManager.handleActivityStreamItem(userId, sk, message);
  }
}
