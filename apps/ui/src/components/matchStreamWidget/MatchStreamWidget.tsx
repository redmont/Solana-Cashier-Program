'use client';

import { FC, useMemo } from 'react';
import dynamic from 'next/dynamic';

import { youTubeStreamId } from '@/config';
import { useWallet } from '@/hooks';

import { YouTubeStream } from './YoutubeStream';
import { Tooltip } from '../Tooltip';
import { BroadcastIcon } from '@/icons';
import { useAtomValue } from 'jotai';
import { fightersAtom, matchStatusAtom } from '@/store/match';
import { MatchProgress } from '../matchProgress';

// The Red5Pro SDK does not support SSR,
// so we need to load it dynamically.
const Red5Stream = dynamic(() => import('./Red5Stream'), {
  ssr: false,
});

type StreamSource = 'cloudflare' | 'youtube' | 'red5' | 'static';

export const MatchStreamWidget: FC = () => {
  const { isConnected } = useWallet();
  const fighters = useAtomValue(fightersAtom);
  const matchStatus = useAtomValue(matchStatusAtom);

  let streamSource: StreamSource = 'static';

  if (youTubeStreamId) {
    streamSource = 'youtube';
  } else {
    streamSource = 'red5';
  }

  const streamViewExpected = useMemo(
    () => matchStatus !== 'pendingStart',
    [matchStatus],
  );

  return (
    <div className="match-stream-widget">
      {matchStatus === 'matchInProgress' &&
        fighters.map(
          (fighter, i) =>
            fighter && (
              <div className="fighter-image" key={i}>
                <img src={fighter.imageUrl} alt={fighter.displayName} />
              </div>
            ),
        )}

      {(!isConnected || streamSource === 'youtube') && youTubeStreamId && (
        <YouTubeStream streamId={youTubeStreamId} />
      )}

      {streamSource === 'red5' && <Red5Stream enabled={streamViewExpected} />}

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

      <div className="stream-match-progress">
        <MatchProgress />
      </div>
    </div>
  );
};
