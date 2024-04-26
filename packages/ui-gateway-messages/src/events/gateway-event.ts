export abstract class GatewayEvent {
  static messageType: string;
  abstract timestamp: string;
}

export interface GatewayEventConstructor<T extends GatewayEvent> {
  new (...args: any[]): T;
  messageType: string;
  timestamp: string;
}
