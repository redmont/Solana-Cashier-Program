import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';

export class ClientDiscovery {
  constructor(private readonly broker: NatsJetStreamClientProxy) {}

  emitToAll(event: string, data: any) {
    this.broker.emit(event, data);
  }

  emitToClient(instanceId: string, event: string, data: any) {
    this.broker.emit(`gateway.${instanceId}.${event}`, data);
  }
}
