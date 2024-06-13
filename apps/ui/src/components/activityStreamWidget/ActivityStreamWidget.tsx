import { FC, useRef, useEffect } from 'react';
import { useAppState } from '@/hooks';
import { useActivityStream } from './useActivityStream';

export const ActivityStreamWidget: FC = () => {
  const { match } = useAppState();
  const { messages } = useActivityStream(match?.series, match?.matchId);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const chatViewportRef = useRef<HTMLDivElement>(null);
  const prevChatViewportRef = useRef<{
    scrollHeight: number;
    clientHeight: number;
  }>({
    scrollHeight: 0,
    clientHeight: 0,
  });

  const handleScroll = () => {
    if (chatViewportRef.current && lastMessageRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatViewportRef.current;

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
        lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
      }

      prevChatViewportRef.current = {
        scrollHeight,
        clientHeight,
      };
    }
  };

  useEffect(() => {
    handleScroll();
  }, [messages]);

  return (
    <div className="widget activity-stream-widget">
      <div className="widget-body">
        <div className="header">Activity Stream</div>

        {messages.length === 0 && (
          <div className="chat-empty">No activity yet.</div>
        )}

        {messages.length > 0 && (
          <div className="chat-viewport" ref={chatViewportRef}>
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
          </div>
        )}
      </div>
    </div>
  );
};
