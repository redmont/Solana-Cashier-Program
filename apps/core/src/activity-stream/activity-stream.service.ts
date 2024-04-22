import { Inject, Injectable } from '@nestjs/common';
import { ActivityStreamItem } from './interfaces/activity-stream-item.interface';
import { Key } from 'src/interfaces/key';
import { Model } from 'nestjs-dynamoose';
import { DateTime } from 'luxon';

export type Activity = 'betPlaced' | 'win' | 'loss';

@Injectable()
export class ActivityStreamService {
  constructor(
    @Inject('activityStreamItem')
    private readonly activityStreamItemModel: Model<ActivityStreamItem, Key>,
  ) {}

  async track(
    matchId: string,
    timestamp: DateTime,
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
  }
}

/*

activityStream#{matchId}#{userId}



*/
