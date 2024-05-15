import { streamUrl } from '@/config';
import dynamic from 'next/dynamic';

// The Millicast SDK does not support SSR,
// so we need to load it dynamically.
const MillicastStream = dynamic(
  () => import('@/components/videoStream/MillicastStream'),
  {
    ssr: false,
  },
);

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
