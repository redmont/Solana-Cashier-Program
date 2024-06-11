import { FC, useRef, useEffect } from 'react';
import { useAppState } from '@/hooks';
import { useActivityStream } from './useActivityStream';

const AUTO_SCROLL_THRESHOLD = 25; //px

export const ActivityStreamWidget: FC = () => {
  const { match } = useAppState();
  const { messages } = useActivityStream(match?.series, match?.matchId);
  const chatViewportRef = useRef<HTMLDivElement>(null);
  const prevScrollHeight = useRef<number>(0);

  const handleScroll = () => {
    if (chatViewportRef.current) {
      const { scrollTop, scrollHeight } = chatViewportRef.current;
      const scrollDiff =
        prevScrollHeight.current === 0
          ? 0
          : scrollHeight - prevScrollHeight.current;
      if (scrollTop <= AUTO_SCROLL_THRESHOLD) {
        chatViewportRef.current.scrollTop = 0;
      } else {
        chatViewportRef.current.scrollTop = scrollTop + scrollDiff;
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
              {messages.toReversed().map((msg, index) => (
                <div key={index} className="chat-message">
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
