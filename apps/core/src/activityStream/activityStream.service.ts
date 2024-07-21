import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ActivityEvent } from './events/activityEvent';
import { MessageConverter } from './messages/messageConverter';
import {
  MatchCompletedMessage,
  PlayerXpUnlockedMessage,
  PoolClosedMessage,
  PoolOpenMessage,
  WhaleWatchMessage,
} from './messages';
import {
  BetPlacedActivityEvent,
  BetXpActivityEvent,
  MatchCompletedActivityEvent,
  PoolClosedActivityEvent,
  PoolOpenActivityEvent,
  WinActivityEvent,
} from './events';
import { PlayerWinMessage } from './messages/playerWin.message';
import { PlayerBetPlacedMessage } from './messages/playerBetPlaced.message';
import { ModuleRef } from '@nestjs/core';
import { ChatService } from '@/chat/chat.service';
import { UserProfilesQueryStoreService } from 'query-store';

export type Activity = 'betPlaced' | 'win' | 'loss';

type ActivityEventConstructor<T extends ActivityEvent> = new (
  ...args: any[]
) => T;

const eventToConverter = new Map<
  ActivityEventConstructor<ActivityEvent>,
  Array<new (...args: any[]) => MessageConverter<ActivityEvent>>
>([
  [BetPlacedActivityEvent, [WhaleWatchMessage, PlayerBetPlacedMessage]],
  [BetXpActivityEvent, [PlayerXpUnlockedMessage]],
  [WinActivityEvent, [PlayerWinMessage]],
  [PoolOpenActivityEvent, [PoolOpenMessage]],
  [PoolClosedActivityEvent, [PoolClosedMessage]],
  [MatchCompletedActivityEvent, [MatchCompletedMessage]],
]);

@Injectable()
export class ActivityStreamService {
  private readonly logger = new Logger(ActivityStreamService.name);

  private eventConverterMap: Map<
    ActivityEventConstructor<ActivityEvent>,
    MessageConverter<ActivityEvent>[]
  >;

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly chatService: ChatService,
    private readonly userProfiles: UserProfilesQueryStoreService,
  ) {}

  onModuleInit() {
    this.mapConverters();
  }

  async mapConverters() {
    this.eventConverterMap = new Map();
    for (const [event, converters] of eventToConverter) {
      const instances = converters.map((converter) =>
        this.moduleRef.get(converter),
      );
      this.eventConverterMap.set(event, instances);
    }
  }

  getConverters<T extends ActivityEvent>(
    activityEvent: T,
  ): MessageConverter<T>[] {
    const converters = this.eventConverterMap.get(
      activityEvent.constructor as ActivityEventConstructor<ActivityEvent>,
    );
    if (!converters) {
      return [];
    }
    return converters as MessageConverter<T>[];
  }

  async track(event: ActivityEvent) {
    try {
      const converters = this.getConverters(event);

      for (const converter of converters) {
        const chatMessage = await converter.convert(event);
        if (chatMessage) {
          const { userId, message } = chatMessage;

          if (userId) {
            const usernames = await this.userProfiles.getUsernames([userId]);
            const username = usernames[userId];

            if (username?.length > 0) {
              await this.chatService.sendSystemMessage({ userId, message });
            }
          } else {
            await this.chatService.sendSystemMessage({ message });
          }
        }
      }
    } catch (e) {
      this.logger.error('Error tracking activity stream event', e);
    }
  }
}
