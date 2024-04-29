'use client';

import { FC, PropsWithChildren } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as Provider } from 'posthog-js/react';

import { postHogHost, postHogKey } from '@/config';

if (postHogHost && postHogKey && typeof window !== 'undefined') {
  posthog.init(postHogKey, {
    api_host: postHogHost,
  });
}

export const PostHogProvider: FC<PropsWithChildren> = ({ children }) => {
  return <Provider client={posthog}>{children}</Provider>;
};
