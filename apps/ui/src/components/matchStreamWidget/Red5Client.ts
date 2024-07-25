import { WHEPClient } from 'red5pro-webrtc-sdk';

export class Red5Client {
  private whepClient: any;

  constructor(
    private readonly streamName: string,
    private readonly token: string,
    private readonly mediaElementId: string,
  ) {}

  async connect() {
    if (this.whepClient) {
      this.whepClient.unsubscribe();
    }

    const config = {
      protocol: 'https',
      host: 'r5stream.prod.brawl3rs.ai',
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
    };

    this.whepClient = new WHEPClient();
    await this.whepClient.init(config);

    await this.whepClient.subscribe();
  }

  async disconnect() {
    this.whepClient?.unsubscribe();
  }
}
