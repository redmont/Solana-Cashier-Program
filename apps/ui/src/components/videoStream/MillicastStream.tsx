import { streamUrl } from '@/config';
import { Director, View } from '@millicast/sdk';
import { useEffect, useRef } from 'react';

const parseStreamUrl = () => {
  const url = new URL(streamUrl);
  const streamName = url.searchParams.get('streamId');

  const [accountId, stream] = streamName!.split('/');
  return { accountId, streamName: stream };
};

export const MillicastStream = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { accountId, streamName } = parseStreamUrl();

  const tokenGenerator = () =>
    Director.getSubscriber({
      streamName: streamName,
      streamAccountId: accountId,
    });

  useEffect(() => {
    const millicastView = new View(streamName, tokenGenerator);
    millicastView.on('track', (event) => {
      videoRef.current!.srcObject = event.streams[0];
    });

    const connect = async () => {
      try {
        await millicastView.connect();
      } catch (e) {
        await millicastView.reconnect();
      }
    };

    connect();
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay={true}
      muted={true}
      width="100%"
      height="100%"
    ></video>
  );
};
