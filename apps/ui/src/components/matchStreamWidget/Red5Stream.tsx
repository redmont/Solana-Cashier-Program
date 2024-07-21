import { useEffect, useState } from 'react';
import { SoundToggle } from './SoundToggle';
import Image from 'next/image';
import { GetStreamAuthTokenMessage, GetStreamAuthTokenMessageResponse } from '@bltzr-gg/brawlers-ui-gateway-messages';
import { useAppState, useSocket } from '@/hooks';
import { Red5Client } from './Red5Client';

const Red5Stream = ({
  streamViewExpected,
}: {
  streamViewExpected: boolean;
}) => {
  const { connected, send } = useSocket();
  const { match } = useAppState();
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

      if (streamToken && match?.streamId) {
        return new Red5Client(
          match.streamId,
          streamToken,
          "stream",
        );
      }
      return undefined;
    });

    return () => {
      red5Client?.disconnect();
    };
  }, [streamToken, match?.streamId]);


  useEffect(() => {
    if (!streamViewExpected) {
      red5Client?.disconnect();
    } else {
      // Just to check that we are within the same effect context
      const seed = Math.floor(Math.random() * 1000);

      let isOn = true;
      let timeout: any;

      const connect = async () => {
        if (!isOn) return;

        try {
          await red5Client?.connect();
          console.log(`[${seed}] Connected`);
        } catch (e) {
          console.log(`[${seed}] Failed to connect`, e);
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
  }, [streamViewExpected, red5Client]);

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
