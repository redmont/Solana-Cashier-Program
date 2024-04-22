export abstract class BrokerMessage<TResponse extends { success: boolean }> {
  static messageType: string;
}
