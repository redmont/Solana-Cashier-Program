import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useCallback, useEffect, useMemo } from 'react';
import {
  ChatAuthMessage,
  type ChatAuthMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { Chat, Message } from './Chat';

import { useWallet, useSocket } from '@/hooks';
import { pubNubPubKey, pubNubSubKey } from '@/config';
import { useAtom } from 'jotai';
import { chatChannelsAtom, chatMessagesAtom, chatModeAtom } from '@/store/chat';

const byTimetoken = (a: Message, b: Message) =>
  parseFloat(a.timetoken) - parseFloat(b.timetoken);

const notDeleted = (msg: Message) =>
  msg.actions === undefined || msg.actions.deleted?.deleted?.length === 0;

const MESSAGES_LIMIT = 300;
const TRUNCATION_AMOUNT = 50;

const useChat = () => {
  const [mode, setMode] = useAtom(chatModeAtom);
  const [messages, setMessages] = useAtom(chatMessagesAtom);
  const [channels, setChannels] = useAtom(chatChannelsAtom);
  const { address } = useWallet();
  const { connected, send } = useSocket();
  const { user } = useDynamicContext();

  const appendMessage = useCallback(
    (newMessage: Message) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    },
    [setMessages],
  );

  useEffect(() => {
    if (!connected) {
      return;
    }

    let abort = false;

    const initChat = async () => {
      const getTokenResponse = await send<
        ChatAuthMessage,
        ChatAuthMessageResponse
      >(new ChatAuthMessage());

      const chat = await Chat.init({
        publishKey: pubNubPubKey,
        subscribeKey: pubNubSubKey,
        userId: getTokenResponse.authorizedUuid,
        authKey: getTokenResponse.token,
      });

      const filteredChannels = await Promise.all(
        getTokenResponse.channels
          .filter(
            (channelId) =>
              channelId.includes('user') || channelId.includes('general'),
          )
          .map(async (channelId) => {
            const channel = await chat.getChannel(channelId);
            const history = await channel?.getHistory({
              count: 100,
            });
            return { channel, messages: history?.messages || [] };
          }),
      );

      if (!abort) {
        const messages = filteredChannels
          .map((channel) => channel.messages)
          .flat();

        const channels = {
          general:
            filteredChannels.find((c) => c.channel?.id?.includes('general'))
              ?.channel ?? undefined,
          user:
            filteredChannels.find((c) => c.channel?.id?.includes('user'))
              ?.channel ?? undefined,
        };

        messages.sort(byTimetoken);

        setMessages(messages);
        setChannels(channels);
      }
    };

    initChat();

    return () => {
      abort = true;
    };
  }, [connected, address, send, setMessages, setChannels]);

  useEffect(() => {
    if (messages.length > MESSAGES_LIMIT) {
      setMessages((prevMessages) => prevMessages.slice(TRUNCATION_AMOUNT));
    }
  }, [messages.length, setMessages]);

  useEffect(() => {
    const stopUpdates =
      messages.length > 0
        ? Message.streamUpdatesOn(messages, (newMessages) => {
            setMessages(newMessages);
          })
        : () => {};

    return () => {
      stopUpdates();
    };
  }, [appendMessage, messages, setMessages]);

  useEffect(() => {
    let unsub: () => void;
    if (channels?.user) {
      unsub = channels.user.connect((msg) => {
        appendMessage(msg);
      });
    }

    return () => {
      unsub?.();
    };
  }, [appendMessage, channels.user]);

  useEffect(() => {
    let unsub: () => void;
    if (channels?.general) {
      unsub = channels.general.connect((msg) => {
        appendMessage(msg);
      });
    }

    return () => {
      unsub?.();
    };
  }, [appendMessage, channels.general]);

  const sendingIsEnabled = useMemo(() => {
    return channels?.general && mode === 'global' && user;
  }, [channels?.general, mode, user]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (
        !sendingIsEnabled ||
        message.trim().length === 0 ||
        !user?.username ||
        !channels?.general
      ) {
        return;
      }

      await channels.general.sendText(message);
    },
    [channels.general, sendingIsEnabled, user?.username],
  );

  const filteredMessages = useMemo(
    () =>
      mode === 'global'
        ? [...messages].filter(notDeleted)
        : messages.filter((msg) => msg.userId === 'system' && notDeleted(msg)),
    [mode, messages],
  );

  return {
    setMode,
    mode,
    messages: filteredMessages,
    sendingIsEnabled,
    sendMessage,
    channels,
  };
};

export default useChat;
