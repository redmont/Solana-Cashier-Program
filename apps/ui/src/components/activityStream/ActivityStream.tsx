import { FC } from 'react';

export const ActivityStream: FC = () => {
  return (
    <div className="activity-stream">
      <div className="header">Activity Stream</div>
      <div className="chat-viewport">
        <div className="chat-body">
          <div className="chat-message">
            <span className="chat-sender text-primary">Bet placed:</span>
            [?????] points on [Fighter]
          </div>

          <div className="chat-message">
            <span className="chat-sender text-primary">Get ready:</span>
            Fight starts in 5 seconds
          </div>

          <div className="chat-message">
            <span className="chat-sender text-primary">Get ready:</span>
            Fight starts in 4 seconds
          </div>

          <div className="chat-message">
            <span className="chat-sender text-primary">Get ready:</span>
            Fight starts in 3 seconds
          </div>

          <div className="chat-message">
            <span className="chat-sender text-primary">Get ready:</span>
            Fight starts in 2 seconds
          </div>

          <div className="chat-message">
            <span className="chat-sender text-primary">Get ready:</span>
            Fight starts in 1 seconds
          </div>

          <div className="chat-message">
            <span className="chat-sender text-primary">Let's go:</span>
            Fight has started!
          </div>
        </div>
      </div>
    </div>
  );
};
