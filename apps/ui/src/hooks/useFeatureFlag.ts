'use client';

import { useFeatureFlagEnabled } from 'posthog-js/react';
import { postHogKey } from '@/config/env';

const features = ['withdrawals', 'progression', 'challenges'] as const;
type Feature = (typeof features)[number];

// dev overrides for local testing
const overrides: Partial<Record<Feature, boolean>> = {};

export function useFeatureFlag(flag: (typeof features)[number]) {
  const enabled = useFeatureFlagEnabled(flag);
  return overrides[flag] ?? (postHogKey ? enabled : true);
}
