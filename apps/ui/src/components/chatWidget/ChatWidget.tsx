'use client';

import { Button } from 'primereact/button';
import { ChatIcon } from '@/icons/ChatIcon';
import { BellIcon } from '@/icons/BellIcon';
import { classNames } from 'primereact/utils';
import { InputText } from 'primereact/inputtext';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TimetokenUtils } from '@pubnub/chat';
import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import Markdown from 'react-markdown';

import { SendMessageIcon } from '@/icons/SendMessageIcon';
import useChat from './useChat';
import { Scrollable, ScrollableRef } from '../Scrollable';
import Clock from '@/icons/Clock';
import MessageAuthor from './MessageAuthor';
import useElementInView from '@/hooks/useElementIntersected';

const parseTimetoken = (timetoken: string) => {
  const date = dayjs.utc(TimetokenUtils.timetokenToDate(timetoken));

  return date.local().format('HH:mm');
};

export const ChatWidget = () => {
  const [value, setValue] = useState('');
  const [scrollSticky, setScrollSticky] = useState(true);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const lastMessageIsInView = useElementInView(lastMessageRef.current);
  const scrollableRef = useRef<ScrollableRef>(null);
  const prevChatViewportRef = useRef<{
    scrollHeight: number;
    clientHeight: number;
  }>({
    scrollHeight: 0,
    clientHeight: 0,
  });
  const [mode, setMode] = useState<'global' | 'alerts'>('global');
  const { messages, sendMessage, channels, sendingIsEnabled } = useChat(mode);

  useEffect(() => {
    const element = scrollableRef.current?.getElement()?.lastChild;

    const onScoll = (event: Event) => {
      const target = event.target as HTMLElement;

      setScrollSticky(
        target.scrollHeight - target.scrollTop === target.clientHeight,
      );
    };

    element?.addEventListener('scroll', onScoll);

    return () => {
      element?.removeEventListener('scroll', onScoll);
    };
  }, []);

  const scrollDown = useCallback(() => {
    const messageContainer = lastMessageRef.current?.parentElement;
    if (messageContainer) {
      messageContainer.scroll({
        top: messageContainer.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollableRef.current && lastMessageRef.current && scrollSticky) {
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
          scrollDown();
        }, 100);
      }

      prevChatViewportRef.current = {
        scrollHeight,
        clientHeight,
      };
    }
  }, [scrollDown, scrollSticky]);

  const send = useMutation({
    mutationFn: sendMessage,
    onMutate: () => {
      setValue('');
    },
    onSuccess: () => {
      setScrollSticky(true);
      handleScroll();
    },
  });

  useEffect(() => {
    handleScroll();
  }, [messages, handleScroll, lastMessageIsInView]);

  const [lastSeen, setLastSeen] = useState<HTMLDivElement | null>(null);
  const hasNewMessages = !scrollSticky && lastSeen !== lastMessageRef.current;

  useEffect(() => {
    if (lastMessageIsInView) {
      setLastSeen(lastMessageRef.current);
    }
  }, [lastMessageIsInView, messages]);

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      send.mutate(value);
    }
  };

  const handleSendMessageClick = () => {
    send.mutate(value);
  };

  return (
    <div className="widget chat-widget">
      <div className="widget-body">
        <div className="header">
          <div>Chat</div>
          <div className="mode-toggle">
            <div
              onClick={() => setMode('global')}
              className={classNames({ selected: mode === 'global' })}
            >
              <ChatIcon />
              Global
            </div>
            <div
              onClick={() => setMode('alerts')}
              className={classNames({ selected: mode === 'alerts' })}
            >
              <BellIcon />
              Alerts
            </div>
          </div>
        </div>
        {hasNewMessages && (
          <button
            onClick={() => {
              setScrollSticky(true);
              handleScroll();
            }}
            className="chat-new-message-notification"
          >
            <i className="pi pi-chevron-down"></i>
          </button>
        )}
        <Scrollable className="chat-viewport" ref={scrollableRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              ref={index === messages.length - 1 ? lastMessageRef : null}
              className="message"
            >
              <span
                className={classNames('message-ts', {
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
        <div className="chat-actions">
          <InputText
            placeholder={channels?.user ? 'Type a message' : 'Log in to chat'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyUp={handleKeyUp}
            disabled={!sendingIsEnabled}
          />
          <Button
            className="send-message-button"
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
