import { useEffect, useState } from 'react';
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

const Red5Stream = ({
  streamViewExpected,
}: {
  streamViewExpected: boolean;
}) => {
  const streamId = useAtomValue(streamIdAtom);
  const { connected, send } = useSocket();
  const [isMuted, setMuted] = useState(true);
  const [streamToken, setStreamToken] = useState<string | undefined>();
  const [red5Client, setRed5Client] = useState<Red5Client | undefined>();

  useEffect(() => {
    const getToken = async () => {
      const getTokenResult = await send<
        GetStreamAuthTokenMessage,
        GetStreamAuthTokenMessageResponse
      >(new GetStreamAuthTokenMessage());

      if (getTokenResult.success) {
        setStreamToken(getTokenResult.token);
      }
    };

    if (connected && streamViewExpected) {
      // If we are connected to the WebSocket,
      // and we are supposed to show the stream,
      // then we need to get a fresh token.
      getToken();
    }
  }, [streamViewExpected, connected, send]);

  useEffect(() => {
    setRed5Client((prevRed5Client) => {
      prevRed5Client?.disconnect();

      if (streamToken && streamId) {
        return new Red5Client(streamId, streamToken, 'stream');
      }
      return undefined;
    });

    return () => {
      red5Client?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamToken, streamId]);

  useEffect(() => {
    if (!streamViewExpected) {
      red5Client?.disconnect();
    } else {
      let isOn = true;
      let timeout: NodeJS.Timeout;

      const connect = async () => {
        if (!isOn) {
          return;
        }

        try {
          await red5Client?.connect();
        } catch (e) {
          if (timeout) {
            clearTimeout(timeout);
          }
          timeout = setTimeout(connect, 1000);
        }
      };

      if (streamToken) {
        connect();
      }

      return () => {
        isOn = false;
        clearTimeout(timeout);
        red5Client?.disconnect();
      };
    }
  }, [streamViewExpected, red5Client, streamToken]);

  return (
    <>
      {streamViewExpected ? (
        <video
          id="stream"
          width="100%"
          height="100%"
          playsInline={true}
          muted={isMuted}
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
      <SoundToggle muted={isMuted} onChange={setMuted} />
    </>
  );
};

export default Red5Stream;
