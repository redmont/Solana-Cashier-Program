import { streamUrl } from '@/config';
import dynamic from 'next/dynamic';
import { FC } from 'react';
import { Stream as CloudFlareStream } from '@cloudflare/stream-react';

// The Millicast SDK does not support SSR,
// so we need to load it dynamically.
const MillicastStream = dynamic(
  () => import('@/components/videoStream/MillicastStream'),
  {
    ssr: false,
  },
);

interface VideoStreamProps {
  src?: string;
}

export const VideoStream: FC<VideoStreamProps> = ({ src }) => {
  if (streamUrl.indexOf('millicast.com') > -1) {
    return <MillicastStream src={streamUrl} />;
  }

  if (/^[0-9a-f]{32}$/.test(streamUrl)) {
    return <CloudFlareStream controls src={streamUrl} autoplay={true} />;
  }

  return (
    <video
      src={streamUrl}
      autoPlay={true}
      playsInline={true}
      muted={true}
      width="100%"
      height="100%"
    />
  );
};
