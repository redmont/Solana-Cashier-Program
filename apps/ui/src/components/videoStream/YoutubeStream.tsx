import createPlayer from 'youtube-player';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { useEffect, useState, useRef } from 'react';
import { YouTubePlayer } from 'youtube-player/dist/types';

export interface YouTubeStreamProps {
  streamId: string;
}

export const YouTubeStream: React.FC<YouTubeStreamProps> = ({ streamId }) => {
  const [isMuted, setMuted] = useState(true);
  const playerRef = useRef<YouTubePlayer | null>();

  useEffect(() => {
    const player = createPlayer(playerRef.current ?? 'youtube-stream', {
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
    <>
      <div id="youtube-stream"></div>

      <Button
        className={classNames('video-stream-unmute-button', { muted: isMuted })}
        rounded
        onClick={() => setMuted(!isMuted)}
      >
        <i className={`pi ${isMuted ? 'pi-volume-off' : 'pi-volume-up'}`}></i>
        {isMuted && <i className="pi pi-times"></i>}
      </Button>
    </>
  );
};
