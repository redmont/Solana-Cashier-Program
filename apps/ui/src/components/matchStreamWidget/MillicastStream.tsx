import { streamUrl } from '@/config';
import { useSocket } from '@/hooks';
import {
  GetStreamTokenMessage,
  GetStreamTokenMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { Director, View as MillicastView } from '@millicast/sdk';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SoundToggle } from './SoundToggle';

const parseStreamUrl = () => {
  const url = new URL(streamUrl);
  const streamName = url.searchParams.get('streamId');

  const [accountId, stream] = streamName!.split('/');
  return { accountId, streamName: stream };
};

const MillicastStream: React.FC<{ src: string | undefined }> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setMuted] = useState(true);
  const { connected, send } = useSocket();
  const [streamToken, setStreamToken] = useState<string | undefined>();

  const { accountId, streamName } = parseStreamUrl();

  useEffect(() => {
    const getToken = async () => {
      const getTokenResult = await send<
        GetStreamTokenMessage,
        GetStreamTokenMessageResponse
      >(new GetStreamTokenMessage());

      if (getTokenResult.success) {
        setStreamToken(getTokenResult.token);
      }
    };

    if (connected) {
      getToken();
    }
  }, [src, connected, send]);

  const tokenGenerator = useCallback(
    () =>
      Director.getSubscriber({
        streamName: streamName,
        streamAccountId: accountId,
        subscriberToken: streamToken,
      }),
    [streamToken, streamName, accountId],
  );

  useEffect(() => {
    if (src) {
      videoRef.current!.srcObject = null;
      videoRef.current!.src = src;
    } else {
      videoRef.current!.src = '';

      // Just to check that we are within the same effect context
      const seed = Math.floor(Math.random() * 1000);

      let isOn = true;

      const millicastView = new MillicastView(
        streamName,
        tokenGenerator,
        videoRef.current!,
      );

      const connect = async () => {
        if (!isOn) return;

        try {
          await millicastView.connect();
          console.log(`[${seed}] Connected`);
        } catch (e) {
          console.log(`[${seed}] Failed to connect`, e);
          setTimeout(connect, 1000);
        }
      };

      if (streamToken) {
        connect();
      }

      return () => {
        isOn = false;
        millicastView?.stop();
      };
    }
  }, [src, tokenGenerator, streamToken, streamName]);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay={true}
        playsInline={true}
        muted={isMuted}
        width="100%"
        height="100%"
      />

      <SoundToggle muted={isMuted} onChange={setMuted} />
    </>
  );
};

export default MillicastStream;
