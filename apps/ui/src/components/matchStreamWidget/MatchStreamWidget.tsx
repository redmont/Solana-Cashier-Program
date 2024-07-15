'use client';

import { FC, useMemo } from 'react';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

import { MatchStatus } from '@/types';
import { youTubeStreamId } from '@/config';
import { useEthWallet, useAppState } from '@/hooks';

import { YouTubeStream } from './YoutubeStream';
import { Tooltip } from '../Tooltip';
import { BroadcastIcon } from '@/icons';

// The Red5Pro SDK does not support SSR,
// so we need to load it dynamically.
const Red5Stream = dynamic(() => import('./Red5Stream'), {
  ssr: false,
});

type StreamSource = 'millicast' | 'cloudflare' | 'youtube' | 'red5' | 'static';

export const MatchStreamWidget: FC = () => {
  const { isConnected } = useEthWallet();

  const { match } = useAppState();
  const { fighters = [] } = match ?? {};

  let streamSource: StreamSource = 'static';

  if (youTubeStreamId) {
    streamSource = 'youtube';
  } else {
    streamSource = 'red5';
  }

  const streamViewExpected = useMemo(() => match?.status === MatchStatus.BetsOpen || match?.status === MatchStatus.PollingPrices || match?.status === MatchStatus.InProgress, [match?.status]);

  return (
    <div className="match-stream-widget">
      {match?.status === MatchStatus.InProgress &&
        fighters.map((fighter, i) => (
          <div className="fighter-image" key={i}>
            <img src={fighter.imageUrl} alt={fighter.displayName} />
          </div>
        ))}

      {(!isConnected || streamSource === 'youtube') && youTubeStreamId && (
        <YouTubeStream streamId={youTubeStreamId} />
      )}

      {streamSource === 'red5' && (
        <Red5Stream streamViewExpected={streamViewExpected} />
      )}

      {streamViewExpected && (
        <Tooltip content="24/7 Live Stream">
          <div className="live-indicator">
            <div className="broadcast-icon">
              <BroadcastIcon />
            </div>
            <span>LIVE</span>
          </div>
        </Tooltip>
      )}
    </div>
  );
};
