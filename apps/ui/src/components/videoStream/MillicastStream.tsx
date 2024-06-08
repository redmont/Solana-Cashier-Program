import { streamUrl } from '@/config';
import { useSocket } from '@/hooks';
import {
  GetStreamTokenMessage,
  GetStreamTokenMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { Director, View as MillicastView } from '@millicast/sdk';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { useCallback, useEffect, useRef, useState } from 'react';

const parseStreamUrl = () => {
  const url = new URL(streamUrl);
  const streamName = url.searchParams.get('streamId');

  const [accountId, stream] = streamName!.split('/');
  return { accountId, streamName: stream };
};

const MillicastStream: React.FC<{ src: string | undefined }> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  const { connected, send } = useSocket();
  const [streamToken, setStreamToken] = useState<string | undefined>();
  const [millicastView, setMillicastView] = useState<MillicastView | undefined>(
    undefined,
  );

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

    if (connected && !src) {
      // If we are connected to the WebSocket,
      // and we don't have a src override,
      // then we need to get a fresh token.
      getToken();
    }
  }, [connected, src]);

  // We need a new token generator
  // whenever the stream token changes.
  const tokenGenerator = useCallback(
    () =>
      Director.getSubscriber({
        streamName: streamName,
        streamAccountId: accountId,
        subscriberToken: streamToken,
      }),
    [streamToken],
  );

  // Ensure we stop the previous MillicastView.
  useEffect(() => {
    setMillicastView((prevMillicastView) => {
      prevMillicastView?.stop();

      return new MillicastView(streamName, tokenGenerator, videoRef.current!);
    });

    return () => {
      millicastView?.stop();
    };
  }, [tokenGenerator]);

  useEffect(() => {
    if (src) {
      videoRef.current!.srcObject = null;
      videoRef.current!.src = src;

      millicastView?.stop();
    } else {
      videoRef.current!.src = '';

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
  }, [src, millicastView]);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay={true}
        playsInline={true}
        muted={muted}
        width="100%"
        height="100%"
      />

      <Button
        className={classNames('video-stream-unmute-button', { muted })}
        rounded
        onClick={() => setMuted(!muted)}
      >
        <i className={`pi ${muted ? 'pi-volume-off' : 'pi-volume-up'}`}></i>
        {muted && <i className="pi pi-times"></i>}
      </Button>
    </>
  );
};

export default MillicastStream;
