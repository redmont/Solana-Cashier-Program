export abstract class Message<
  TResponse extends { success: boolean } = { success: boolean },
> {
  static messageType: string;
}

export interface MessageConstructor<T extends Message> {
  new (...args: any[]): T;
  messageType: string;
}
