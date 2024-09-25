/* eslint-disable no-console */
import { streamingServerHostname } from '@/config/env';
import { WHEPClient } from 'red5pro-webrtc-sdk';

const TIMEOUT_MS = 15_000;

class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class Red5Client {
  private whepClient?: WHEPClient;

  constructor(
    private readonly streamName: string,
    private readonly token: string,
    private readonly mediaElementId: string,
  ) {}

  connected = false;
  errored = false;

  private async withTimeout<T>(
    promise: Promise<T>,
    ms = TIMEOUT_MS,
  ): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new TimeoutError('Timeout')), ms),
    );
    return await Promise.race([promise, timeout]);
  }

  async initialize() {
    this.whepClient = new WHEPClient();

    await this.whepClient.init({
      protocol: 'https',
      host: streamingServerHostname,
      app: 'live',
      streamName: this.streamName,
      rtcConfiguration: {
        iceServers: [{ urls: 'stun:stun2.l.google.com:19302' }],
        iceCandidatePoolSize: 2,
        bundlePolicy: 'max-bundle',
      },
      connectionParams: {
        username: 'user',
        password: 'pass',
        token: this.token,
      },
      mediaElementId: this.mediaElementId,
    });
  }

  async subscribe() {
    await this.withTimeout(this.whepClient!.subscribe());
  }

  async connect() {
    this.errored = false;
    this.whepClient?.unsubscribe();

    try {
      await this.initialize();
      await this.subscribe();
      this.connected = true;
    } catch (e) {
      console.warn('Error connecting to stream:', (e as Error).message);
      this.errored = true;
    }
  }

  async disconnect() {
    this.whepClient?.unsubscribe();
    this.connected = false;
  }
}
