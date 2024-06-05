import { streamUrl, youTubeStreamId } from '@/config';
import dynamic from 'next/dynamic';
import { FC } from 'react';
import { Stream as CloudFlareStream } from '@cloudflare/stream-react';
import { YouTubeStream } from './YoutubeStream';
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
  if (youTubeStreamId?.length > 0) {
    return <YouTubeStream streamId={youTubeStreamId} />;
  }

  if (streamUrl.indexOf('millicast.com') > -1) {
    return <MillicastStream src={src} />;
  }

  if (/^[0-9a-f]{32}$/.test(streamUrl)) {
    if (src) {
      return (
        <video
          src={src}
          autoPlay={true}
          playsInline={true}
          width="100%"
          height="100%"
        />
      );
    } else {
      return <CloudFlareStream controls src={streamUrl} autoplay={true} />;
    }
  }

  return null;
};
