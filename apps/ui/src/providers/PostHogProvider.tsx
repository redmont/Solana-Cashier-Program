'use client';

import { FC, PropsWithChildren } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as Provider } from 'posthog-js/react';

import { postHogFeatureFlags, postHogHost, postHogKey } from '@/config/env';

interface FeatureFlags {
  [key: string]: boolean;
}

const featureFlags = postHogFeatureFlags.split(',').reduce((acc, flag) => {
  acc[flag] = true;
  return acc;
}, {} as FeatureFlags);

if (postHogHost && postHogKey && typeof window !== 'undefined') {
  posthog.init(postHogKey, {
    api_host: postHogHost,
    // Bootstrapping feature flags just sets the 'default' value
    // for a feature flag. The actual value is eventually fetched
    // from PostHog, but that has a slight delay.
    bootstrap: {
      featureFlags,
    },
  });
}

export const PostHogProvider: FC<PropsWithChildren> = ({ children }) => {
  return <Provider client={posthog}>{children}</Provider>;
};
