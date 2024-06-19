'use client';

import { FC, useCallback } from 'react';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import duration from 'dayjs/plugin/duration';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Stream as CloudFlareStream } from '@cloudflare/stream-react';

dayjs.extend(duration);

import { MatchStatus } from '@/types';
import { youTubeStreamId, streamUrl, trailerUrl } from '@/config';
import { useEthWallet, useAppState } from '@/hooks';

import { YouTubeStream } from './YoutubeStream';

// The Millicast SDK does not support SSR,
// so we need to load it dynamically.
const MillicastStream = dynamic(() => import('./MillicastStream'), {
  ssr: false,
});

type StreamSource = 'millicast' | 'cloudflare' | 'youtube' | 'static';

export const MatchStreamWidget: FC = () => {
  const { isConnected } = useEthWallet();
  const { setShowAuthFlow, setShowDynamicUserProfile } = useDynamicContext();

  const { match } = useAppState();
  const { fighters = [] } = match ?? {};

  let streamSource: StreamSource = 'static';

  if (streamUrl.indexOf('millicast.com')) {
    streamSource = 'millicast';
  } else if (streamUrl.indexOf('youtube.com') >= 0) {
    streamSource = 'youtube';
  } else if (/^[0-9a-f]{32}$/.test(streamUrl)) {
    streamSource = 'cloudflare';
  }

  const handleBannerClick = useCallback(() => {
    isConnected ? setShowDynamicUserProfile(true) : setShowAuthFlow(true);
  }, [isConnected, setShowAuthFlow, setShowDynamicUserProfile]);

  return (
    <div className="match-stream-widget">
      {match?.status === MatchStatus.InProgress && (
        <>
          <div className="fighter-image">
            <img src={fighters[0]?.imageUrl} />
          </div>

          <div className="fighter-image">
            <img src={fighters[1]?.imageUrl} />
          </div>
        </>
      )}

      {(!isConnected || streamSource === 'youtube') && youTubeStreamId && (
        <YouTubeStream streamId={youTubeStreamId} />
      )}

      {!isConnected && !youTubeStreamId && (
        <img
          className="join-banner"
          src="/join-banner.jpg"
          onClick={handleBannerClick}
        />
      )}

      {isConnected && streamSource === 'millicast' && <MillicastStream />}

      {isConnected && streamSource === 'cloudflare' && (
        <CloudFlareStream controls src={streamUrl} autoplay={true} />
      )}

      {isConnected && streamSource === 'static' && (
        <video
          src={streamUrl}
          autoPlay={true}
          playsInline={true}
          width="100%"
          height="100%"
        />
      )}
    </div>
  );
};
