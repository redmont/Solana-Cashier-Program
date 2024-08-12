import { Chat } from '@pubnub/chat';
import { Message, type Channel } from '@pubnub/chat';

export { Message, Channel };

declare module '@pubnub/chat' {
  interface Chat {
    subscriptions: Record<string, Set<unknown>>;
    subscribe(channel: string): void;
  }
}

Chat.prototype.subscribe = function (channel: string) {
  if (!this.subscriptions) {
    this.subscriptions = {};
  }

  const subscriptionId = Math.floor(Math.random() * Date.now()).toString(36);

  const channelSubIds = (this.subscriptions[channel] ||= new Set());

  if (!channelSubIds.size) {
    this.sdk.subscribe({ channels: [channel], withPresence: false });
  }

  channelSubIds.add(subscriptionId);

  return () => {
    if (!channelSubIds || !channelSubIds.has(subscriptionId)) {
      return;
    }

    channelSubIds.delete(subscriptionId);

    if (!channelSubIds.size) {
      this.sdk.unsubscribe({ channels: [channel] });
    }
  };
};

export { Chat };
