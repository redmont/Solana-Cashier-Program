import mixpanel from 'mixpanel-browser';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

const apiKey = process.env.NEXT_PUBLIC_MIXPANEL_API_KEY;

export const Analytics = () => {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (!apiKey) {
      return;
    }

    mixpanel.init(apiKey, {
      debug: true,
      track_pageview: true,
      persistence: 'localStorage',
    });
  }, []);

  useEffect(() => {
    if (!apiKey) {
      return;
    }

    if (isConnected && address) {
      mixpanel.identify(address.toLowerCase());
    } else {
      mixpanel.reset();
    }
  }, [address, isConnected]);

  return null;
};
