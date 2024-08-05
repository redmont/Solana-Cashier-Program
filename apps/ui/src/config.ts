export const serverUrl =
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3333';

export const trailerUrl = process.env.NEXT_PUBLIC_TRAILER_URL || '';

export const streamUrl = process.env.NEXT_PUBLIC_STREAM_URL || '';

export const postHogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';

export const postHogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

export const dynamicWalletEnvironmentId =
  process.env.NEXT_PUBLIC_DYNAMIC_WALLET_ENVIRONMENT_ID || '';

export const youTubeStreamId = process.env.NEXT_PUBLIC_YOUTUBE_STREAM_ID || '';

export const pubNubPubKey = process.env.NEXT_PUBLIC_PUBNUB_PUB_KEY || '';

export const pubNubSubKey = process.env.NEXT_PUBLIC_PUBNUB_SUB_KEY || '';

export const LOCAL_PRICE_CACHE_PERIOD = 1000 * 10;

export const streamingServerHostname =
  process.env.NEXT_PUBLIC_STREAMING_SERVER_HOSTNAME || '';
