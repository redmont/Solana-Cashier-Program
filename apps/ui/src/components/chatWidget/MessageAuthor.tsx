import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Message } from '@pubnub/chat';
import { cn as classNames } from '@/lib/utils';

const MessageAuthor = ({ msg }: { msg: Message }) => {
  const { user } = useDynamicContext();
  if (msg.userId === 'system') {
    return null;
  } else {
    const username = (msg.content as typeof msg.content & { username?: string })
      .username;

    return (
      <span
        className={classNames('message-sender', {
          self: username === user?.username,
        })}
      >
        {username}:
      </span>
    );
  }
};

export default MessageAuthor;
