import { streamUrl } from '@/config';
import { useSocket } from '@/hooks';
import {
  GetStreamTokenMessage,
  GetStreamTokenMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { Director, View } from '@millicast/sdk';
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
      const millicastView = new View(
        streamName,
        tokenGenerator,
        videoRef.current!,
        true,
      );

      const connect = async () => {
        try {
          await millicastView.connect();
        } catch (e) {
          console.log('Failed to connect', e);
          await millicastView.reconnect();
        }
      };

      if (streamToken) {
        connect();
      }

      return () => {
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
