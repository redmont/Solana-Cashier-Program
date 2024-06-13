import { streamUrl } from '@/config';
import { useAppState, useSocket } from '@/hooks';
import {
  GetStreamTokenMessage,
  GetStreamTokenMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { Director, View as MillicastView } from '@millicast/sdk';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SoundToggle } from './SoundToggle';
import { MatchStatus } from '@/types';

const parseStreamUrl = () => {
  try {
    const url = new URL(streamUrl);
    const streamName = url.searchParams.get('streamId');

    const [accountId, stream] = streamName!.split('/');
    return { accountId, streamName: stream };
  } catch (e) {
    console.error('Failed to parse stream URL', e);
    return { accountId: '', streamName: '' };
  }
};

const MillicastStream: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setMuted] = useState(true);
  const { connected, send } = useSocket();
  const { match } = useAppState();
  const [streamToken, setStreamToken] = useState<string | undefined>();
  const [millicastView, setMillicastView] = useState<MillicastView | undefined>(
    undefined,
  );

  const { accountId, streamName } = parseStreamUrl();

  const showStream = useMemo(
    () => match?.status !== MatchStatus.PendingStart,
    [match?.status],
  );

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

    if (connected && showStream) {
      // If we are connected to the WebSocket,
      // and we are supposed to show the stream,
      // then we need to get a fresh token.
      getToken();
    }
  }, [showStream, connected, send]);

  // We need a new token generator
  // whenever the stream token changes.
  const tokenGenerator = useCallback(
    () =>
      Director.getSubscriber({
        streamName: streamName,
        streamAccountId: accountId,
        subscriberToken: streamToken,
      }),
    [streamToken, streamName, accountId],
  );

  // Ensure we stop the previous MillicastView.
  useEffect(() => {
    setMillicastView((prevMillicastView) => {
      prevMillicastView?.stop();

      if (streamName) {
        return new MillicastView(streamName, tokenGenerator, videoRef.current!);
      }
      return undefined;
    });

    return () => {
      millicastView?.stop();
    };
  }, [tokenGenerator]);

  useEffect(() => {
    if (!showStream) {
      videoRef.current!.srcObject = null;

      millicastView?.stop();
    } else {
      // Just to check that we are within the same effect context
      const seed = Math.floor(Math.random() * 1000);

      let isOn = true;
      let timeout: any;

      const connect = async () => {
        if (!isOn) return;

        try {
          await millicastView?.connect();
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
        millicastView?.stop();
      };
    }
  }, [showStream, millicastView]);

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
