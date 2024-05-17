import { streamUrl } from '@/config';
import { Director, View } from '@millicast/sdk';
import { Button } from 'primereact/button';
import { useEffect, useRef, useState } from 'react';

const parseStreamUrl = () => {
  const url = new URL(streamUrl);
  const streamName = url.searchParams.get('streamId');

  const [accountId, stream] = streamName!.split('/');
  return { accountId, streamName: stream };
};

const MillicastStream: React.FC<{ src: string | undefined }> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);

  const { accountId, streamName } = parseStreamUrl();

  const tokenGenerator = () =>
    Director.getSubscriber({
      streamName: streamName,
      streamAccountId: accountId,
    });

  useEffect(() => {
    if (src) {
      videoRef.current!.srcObject = null;
      videoRef.current!.src = src;
    } else {
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
    }
  }, [src]);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay={true}
        muted={muted}
        width="100%"
        height="100%"
      />
      <Button
        onClick={() => setMuted(!muted)}
        style={{ position: 'absolute', left: '10px', bottom: '15px' }}
      >
        {muted ? 'Unmute' : 'Mute'}
      </Button>
    </>
  );
};

export default MillicastStream;
