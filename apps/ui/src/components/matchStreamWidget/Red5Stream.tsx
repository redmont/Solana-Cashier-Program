import { useEffect, useMemo } from 'react';
import { SoundToggle } from './SoundToggle';
import Image from 'next/image';
import {
  GetStreamAuthTokenMessage,
  GetStreamAuthTokenMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { useSocket } from '@/hooks';
import { Red5Client } from './Red5Client';
import { useAtomValue } from 'jotai';
import { streamIdAtom } from '@/store/match';
import { useQuery } from '@tanstack/react-query';
import { soundsOnAtom } from '@/store/app';

const Red5Stream = ({ enabled }: { enabled: boolean }) => {
  const streamId = useAtomValue(streamIdAtom);
  const soundsOn = useAtomValue(soundsOnAtom);
  const { connected, send } = useSocket();

  const token = useQuery({
    enabled: enabled && connected,
    queryKey: ['streamToken'],
    queryFn: async () => {
      const getTokenResult = await send<
        GetStreamAuthTokenMessage,
        GetStreamAuthTokenMessageResponse
      >(new GetStreamAuthTokenMessage());

      return getTokenResult.token;
    },
  });

  const client = useMemo(() => {
    if (enabled && connected && token.data !== undefined && streamId !== null) {
      return new Red5Client(streamId, token.data, 'stream');
    }
    return null;
  }, [enabled, connected, token.data, streamId]);

  useEffect(() => {
    if (!enabled) {
      client?.disconnect();
    } else if (client) {
      client.connect();

      const interval = setInterval(() => {
        if (client.connected) {
          clearInterval(interval);
        }

        if (!client.connected && client.errored) {
          client.connect();
        }
      }, 1500);

      return () => {
        client.disconnect();
        clearInterval(interval);
      };
    }
  }, [enabled, client, connected]);

  return (
    <>
      {enabled ? (
        <video
          id="stream"
          width="100%"
          height="100%"
          playsInline={true}
          muted={!soundsOn}
          autoPlay
        />
      ) : (
        <Image
          src="/next_fight.jpg"
          width="640"
          height="360"
          alt="Next fight starting soon"
          className="fight-starting-soon"
        />
      )}
      <SoundToggle />
    </>
  );
};

export default Red5Stream;
