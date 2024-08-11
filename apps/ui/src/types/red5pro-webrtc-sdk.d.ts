declare module 'red5pro-webrtc-sdk' {
  export class WHEPClient {
    constructor();
    init(config: WHEPClientConfig): Promise<void>;
    subscribe(): Promise<void>;
    unsubscribe(): void;
  }

  export type WHEPClientProtocol = 'https';

  export interface WHEPClientConfig {
    protocol: WHEPClientProtocol;
    host: string;
    app: string;
    streamName: string;
    rtcConfiguration: {
      iceServers: { urls: string }[];
      iceCandidatePoolSize: number;
      bundlePolicy: 'max-bundle';
    };
    connectionParams: {
      username: string;
      password: string;
      token: string;
    };
    mediaElementId: string;
  }
}
