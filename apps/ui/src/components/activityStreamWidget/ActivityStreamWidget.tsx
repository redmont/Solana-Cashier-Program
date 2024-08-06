import { FC, useRef, useEffect, useCallback } from 'react';
import { useActivityStream } from './useActivityStream';
import { Scrollable, ScrollableRef } from '@/components/Scrollable';

export const ActivityStreamWidget: FC = () => {
  const { messages } = useActivityStream();
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<ScrollableRef>(null);
  const prevChatViewportRef = useRef<{
    scrollHeight: number;
    clientHeight: number;
  }>({
    scrollHeight: 0,
    clientHeight: 0,
  });

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
          lastMessageRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'start',
          });
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
  }, [messages, handleScroll]);

  return (
    <div className="widget activity-stream-widget">
      <div className="widget-body">
        <div className="header">Activity Stream</div>

        {messages.length === 0 && (
          <div className="chat-empty">No activity yet.</div>
        )}

        {messages.length > 0 && (
          <Scrollable className="chat-viewport" ref={scrollableRef}>
            <div className="chat-body">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  ref={index === messages.length - 1 ? lastMessageRef : null}
                  className="chat-message"
                >
                  <span className="chat-message-timestamp text-primary">
                    [{msg.timestamp}]
                  </span>
                  {msg.text}
                </div>
              ))}
            </div>
          </Scrollable>
        )}
      </div>
    </div>
  );
};
