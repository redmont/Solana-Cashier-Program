import { streamUrl } from '@/config';
import { MillicastStream } from './MillicastStream';

export const VideoStream = () => {
  if (streamUrl.indexOf('millicast.com') > -1) {
    return <MillicastStream />;
  }

  return (
    <video
      src={streamUrl}
      autoPlay={true}
      muted={true}
      width="100%"
      height="100%"
    />
  );
};
