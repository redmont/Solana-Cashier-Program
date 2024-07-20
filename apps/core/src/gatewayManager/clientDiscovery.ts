import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { firstValueFrom } from 'rxjs';

export class ClientDiscovery {
  constructor(private readonly broker: NatsJetStreamClientProxy) {}

  async emitToAll(event: string, data: any) {
    await firstValueFrom(this.broker.emit(event, data));
  }

  async emitToClient(instanceId: string, event: string, data: any) {
    await firstValueFrom(
      this.broker.emit(`gateway.${instanceId}.${event}`, data),
    );
  }
}
