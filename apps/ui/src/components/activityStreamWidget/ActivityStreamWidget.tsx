import { FC, useRef, useEffect } from 'react';
import { useAppState } from '@/hooks';
import { useActivityStream } from './useActivityStream';

export const ActivityStreamWidget: FC = () => {
  const { match } = useAppState();
  const { messages } = useActivityStream(match?.series, match?.matchId);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const chatViewportRef = useRef<HTMLDivElement>(null);
  const prevScrollHeight = useRef<number>(0);

  const handleScroll = () => {
    console.log('trigger scroll');
    if (chatViewportRef.current && lastMessageRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatViewportRef.current;
      const scrollDiff =
        prevScrollHeight.current === 0
          ? 0
          : scrollHeight - prevScrollHeight.current;
      if (scrollHeight - (scrollTop + clientHeight) <= 2 * scrollDiff) {
        // scroll if previous message was visible in previous state
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
      prevScrollHeight.current = scrollHeight;
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
