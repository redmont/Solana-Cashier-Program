import createPlayer from 'youtube-player';
import { useEffect, useState, useRef } from 'react';
import { YouTubePlayer } from 'youtube-player/dist/types';
import { SoundToggle } from './SoundToggle';

export interface YouTubeStreamProps {
  streamId: string;
}

export const YouTubeStream: React.FC<YouTubeStreamProps> = ({ streamId }) => {
  const [isMuted, setMuted] = useState(true);
  const playerRef = useRef<YouTubePlayer | null>();

  useEffect(() => {
    let player = playerRef.current;

    if (!player) {
      player = createPlayer('youtube-stream', {
        height: '100%',
        width: '100%',
        playerVars: {
          controls: 0,
          autoplay: 1,
          playsinline: 1,
          // @ts-expect-error: `mute` is in the list but has to set for autoplay
          mute: 1,
        },
      });
    }

    player.loadVideoById(streamId);

    playerRef.current = player;
  }, [streamId]);

  useEffect(() => {
    const player = playerRef.current;

    if (!player) return;

    if (!isMuted) {
      player.unMute();
      player.setVolume(100);
    } else {
      player.mute();
    }
  }, [isMuted]);

  return (
    <div className="youtube-stream-container">
      <div id="youtube-stream"></div>

      <SoundToggle muted={isMuted} onChange={setMuted} />
    </div>
  );
};
