import mixpanel from 'mixpanel-browser';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { mixpanelApiKey } from '@/config';

export const Analytics = () => {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (!mixpanelApiKey) {
      return;
    }

    mixpanel.init(mixpanelApiKey, {
      debug: true,
      track_pageview: true,
      persistence: 'localStorage',
    });
  }, []);

  useEffect(() => {
    if (!mixpanelApiKey) {
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
