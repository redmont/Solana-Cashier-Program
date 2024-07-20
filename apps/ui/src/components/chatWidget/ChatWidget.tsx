'use client';

import { pubNubPubKey, pubNubSubKey } from '@/config';
import { useEthWallet, useSocket } from '@/hooks';
import {
  ChatAuthMessage,
  ChatAuthMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Scrollable, ScrollableRef } from '../Scrollable';
import { Channel, Chat, TimetokenUtils } from '@pubnub/chat';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { SendMessageIcon } from '@/icons/SendMessageIcon';
import { classNames } from 'primereact/utils';
import { ChatIcon } from '@/icons/ChatIcon';
import { BellIcon } from '@/icons/BellIcon';
import Markdown from 'react-markdown'
import { useDynamicContext, UserProfile } from '@dynamic-labs/sdk-react-core';

dayjs.extend(utc);

const parseTimetoken = (timetoken: string) => {
  const date = dayjs.utc(TimetokenUtils.timetokenToDate(timetoken));

  return date.local().format('HH:mm');
};

const MessageSender = ({ msg, user }: { msg: any, user?: UserProfile }) => {
  if (msg.userId === 'system') {
    return null;
  } else {
    return <span className={classNames("message-sender", {
      self: msg.content.username === user?.username
    })}>{msg.content.username}:</span>;
  }
};

export const ChatWidget = () => {
  const { connected, send } = useSocket();
  const { user } = useDynamicContext();
  const { address, } = useEthWallet();
  const [value, setValue] = useState('');
  const [channels, setChannels] = useState<
    | {
      general?: Channel;
      user?: Channel;
    }
    | undefined
  >();
  const [messages, setMessages] = useState<any[]>([]);
  const [pendingMessages, setPendingMessages] = useState<any[]>([]);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<ScrollableRef>(null);
  const prevChatViewportRef = useRef<{
    scrollHeight: number;
    clientHeight: number;
  }>({
    scrollHeight: 0,
    clientHeight: 0,
  });
  const [mode, setMode] = useState<'global' | 'alerts'>('global');

  const filteredMessages = useMemo(() => {
    if (mode === 'global') {
      return [...messages, ...pendingMessages];
    }

    return messages.filter((msg) => msg.userId === 'system');
  }, [mode, messages, pendingMessages]);

  const handleScroll = useCallback(() => {
    if (scrollableRef.current && lastMessageRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollableRef.current.getElement() as HTMLElement;

      const { scrollHeight: prevScrollHeight, clientHeight: prevClientHeight } =
        prevChatViewportRef.current;

      const scrollDiff =
        prevScrollHeight === 0 ? 0 : scrollHeight - prevScrollHeight;

      if (
        scrollHeight - (scrollTop + Math.max(clientHeight, prevClientHeight)) <=
        2 * scrollDiff
      ) {
        // checking previous clientHeight to handle scroll after resize
        // scroll if previous message was visible in previous state
        // have to use timeout to make it working with Scrollable

        setTimeout(() => {
          const messageContainer = lastMessageRef.current?.parentElement;
          if (messageContainer) {
            messageContainer.scroll({ top: messageContainer.scrollHeight, behavior: 'smooth' })
          }
        }, 100);
      }

      prevChatViewportRef.current = {
        scrollHeight,
        clientHeight,
      };
    }
  }, []);

  useEffect(() => {
    handleScroll();
  }, [filteredMessages, handleScroll]);

  const addSortedMessages = (newMessages: any[]) => {
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, ...newMessages];

      updatedMessages.sort((a, b) => a.timetoken - b.timetoken);

      return updatedMessages;
    })
  }

  const addMessage = (newMessage: any) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    if (newMessage.content.username === user?.username) {
      // Remove from pending messages
      setPendingMessages((prevPendingMessages) => prevPendingMessages.filter((pendingMsg) => pendingMsg.text !== newMessage.text));
    }
  };

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

      // We have to do this, as the Chat SDK forces withPresence
      (chat as any).subscribe = function(channel: string) {
        const subscriptionId = Math.floor(Math.random() * Date.now()).toString(
          36
        );
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

      setMessages([]);
      setPendingMessages([]);

      for (const channel of getTokenResponse.channels) {
        const ch = await chat.getChannel(channel);

        if (ch) {
          if (channel.indexOf('general') > -1) {
            setChannels((prevChannels) => ({ ...prevChannels, general: ch }));
          } else {
            setChannels((prevChannels) => ({ ...prevChannels, user: ch }));
          }
          const now = TimetokenUtils.dateToTimetoken(new Date());
          const messageHistory = await ch.getHistory({
            startTimetoken: now.toString(),
            count: 100,
          })

          if (!abort) {
            addSortedMessages(messageHistory.messages);
          }
        }
      }
    };

    initChat();

    return () => {
      abort = true;
    };
  }, [connected, address]);

  useEffect(() => {
    let unsub: any;
    if (channels?.general) {
      unsub = channels.general.connect((msg) => {
        addMessage(msg)
      });
    }

    return () => {
      unsub?.();
    }
  }, [channels?.general])

  useEffect(() => {
    let unsub: any;
    if (channels?.user) {
      unsub = channels.user.connect((msg) => {
        addMessage(msg)
      });
    }

    return () => {
      unsub?.();
    }
  }, [channels?.user])

  const inputEnabled = useMemo(() => {
    return channels?.user && mode === 'global'
  }, [channels?.user, mode])

  const sendMessage = useCallback(
    (message: string) => {
      if (message.trim().length === 0) {
        return;
      }

      setPendingMessages((prevPendingMessages) => [...prevPendingMessages, {
        content: { username: user?.username },
        text: message,
        timetoken: TimetokenUtils.dateToTimetoken(new Date()).toString(),
      }]);
      channels?.general?.sendText(message);
      setValue('');
    },
    [channels?.general]
  );

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      sendMessage(value);
    }
  };

  const handleSendMessageClick = () => {
    sendMessage(value);
  }

  return (
    <div className="widget chat-widget">
      <div className="widget-body">
        <div className="header">
          <div>Chat</div>

          <div className="mode-toggle">
            <div onClick={() => setMode('global')} className={classNames({ selected: mode === 'global' })}><ChatIcon />Global</div>
            <div onClick={() => setMode('alerts')} className={classNames({ selected: mode === 'alerts' })}><BellIcon />Alerts</div>
          </div>
        </div>

        <Scrollable className="chat-viewport" ref={scrollableRef}>
          <>
            {filteredMessages.map((msg, index) => (
              <div
                key={index}
                ref={index === filteredMessages.length - 1 ? lastMessageRef : null}
                className="message"
              >
                <span className={classNames("message-ts", {
                  system: msg.userId === 'system',
                })}>
                  {parseTimetoken(msg.timetoken)}
                </span>{' '}
                <MessageSender msg={msg} user={user} />
                <span className="message-text">{msg.meta?.type === 'markdown' ? <Markdown>{msg.text}</Markdown> : msg.text}</span>
              </div>
            ))}
          </>
        </Scrollable>

        <div className="chat-actions">
          <InputText
            placeholder={channels?.user ? "Type a message" : "Log in to chat"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyUp={handleKeyUp}
            disabled={!inputEnabled}
          />
          <Button className="send-message-button" onClick={handleSendMessageClick} disabled={!inputEnabled}>
            <SendMessageIcon />
          </Button>
        </div>

      </div>
    </div >
  );
};
