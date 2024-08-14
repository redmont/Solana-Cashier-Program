import { useFeatureFlagEnabled } from 'posthog-js/react';
import { postHogKey } from '@/config';

export function useFeatureFlag(flag: string) {
  const enabled = useFeatureFlagEnabled(flag);
  return postHogKey ? enabled : true;
}
