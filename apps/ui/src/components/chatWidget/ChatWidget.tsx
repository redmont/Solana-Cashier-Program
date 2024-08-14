'use client';

import { Button } from '@/components/ui/button';
import { ChatIcon } from '@/icons/ChatIcon';
import { BellIcon } from '@/icons/BellIcon';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TimetokenUtils } from '@pubnub/chat';
import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import Markdown from 'react-markdown';

import { SendMessageIcon } from '@/icons/SendMessageIcon';
import useChat from './useChat';
import { Scrollable, ScrollableRef } from '@/components/ui/scrollable';
import Clock from '@/icons/Clock';
import MessageAuthor from './MessageAuthor';
import { Input } from '../ui/input';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

const parseTimetoken = (timetoken: string) => {
  const date = dayjs.utc(TimetokenUtils.timetokenToDate(timetoken));

  return date.local().format('HH:mm');
};

export const ChatWidget = () => {
  const { user } = useDynamicContext();
  const [value, setValue] = useState('');
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<ScrollableRef>(null);
  const { messages, setMode, mode, sendMessage, channels, sendingIsEnabled } =
    useChat();

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(true);

  const scrollBottom = useCallback(() => {
    if (scrollableRef.current) {
      scrollableRef.current.scrollTop = scrollableRef.current?.scrollHeight;
    }
  }, []);

  const scrollToBottomSmooth = useCallback(() => {
    if (scrollableRef.current) {
      scrollableRef.current.scrollTo({
        top: scrollableRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [scrollableRef]);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    const lastUsername =
      lastMsg &&
      (lastMsg.content as typeof lastMsg.content & { username?: string })
        .username;

    const shouldScroll =
      hasScrolledToBottom ||
      (lastMsg && user && user.username === lastUsername);
    if (scrollableRef.current && shouldScroll) {
      scrollBottom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, scrollBottom]);

  const send = useMutation({
    mutationFn: sendMessage,
    onMutate: () => {
      setValue('');
    },
  });

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      send.mutate(value);
    }
  };

  const handleSendMessageClick = () => {
    send.mutate(value);
  };

  const handleScroll = () => {
    if (scrollableRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollableRef.current;
      setHasScrolledToBottom(scrollTop + clientHeight >= scrollHeight - 10);
    }
  };

  return (
    <div className="widget chat-widget">
      <div className="widget-body relative">
        <div className="flex justify-between border-b border-border px-4 py-2">
          <div>Chat</div>
          <div className="mode-toggle">
            <div
              onClick={() => setMode('global')}
              className={cn({ selected: mode === 'global' })}
            >
              <ChatIcon />
              Global
            </div>
            <div
              onClick={() => setMode('alerts')}
              className={cn({ selected: mode === 'alerts' })}
            >
              <BellIcon />
              Alerts
            </div>
          </div>
        </div>
        <Scrollable
          onScroll={handleScroll}
          className="chat-viewport relative"
          ref={scrollableRef}
        >
          {!hasScrolledToBottom && (
            <button
              onClick={scrollToBottomSmooth}
              className="absolute bottom-3 right-5 rounded-tl-md"
            >
              <i className="pi pi-chevron-down rounded-lg border border-secondary p-2 text-secondary"></i>
            </button>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              ref={index === messages.length - 1 ? lastMessageRef : null}
              className="message"
            >
              <span
                className={cn('message-ts', {
                  system: msg.userId === 'system',
                })}
              >
                {parseTimetoken(msg.timetoken)}
              </span>{' '}
              <MessageAuthor msg={msg} />{' '}
              <span className="message-text">
                {msg.meta?.type === 'markdown' ? (
                  <Markdown>{msg.text}</Markdown>
                ) : (
                  msg.text
                )}
              </span>
            </div>
          ))}
        </Scrollable>
        <div className="flex w-full items-center space-x-2 px-4 pb-4 pt-2">
          <Input
            className="grow"
            placeholder={
              channels?.general ? 'Type a message' : 'Log in to chat'
            }
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyUp={handleKeyUp}
            disabled={!sendingIsEnabled}
          />
          <Button
            className="basis-0 px-2.5"
            onClick={handleSendMessageClick}
            disabled={!sendingIsEnabled || send.isPending}
          >
            {send.isPending ? <Clock /> : <SendMessageIcon />}
          </Button>
        </div>
      </div>
    </div>
  );
};
