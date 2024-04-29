import { FC } from 'react';
import { useAppState } from '../appStateProvider';
import { useActivityStream } from './useActivityStream';

export const ActivityStreamWidget: FC = () => {
  const { match } = useAppState();
  const { messages } = useActivityStream(match?.matchId);

  return (
    <div className="widget activity-stream-widget">
      <div className="widget-body">
        <div className="header">Activity Stream</div>

        {messages.length === 0 && (
          <div className="chat-empty">No activity yet.</div>
        )}

        {messages.length > 0 && (
          <div className="chat-viewport">
            <div className="chat-body">
              {messages.map((msg, index) => (
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
