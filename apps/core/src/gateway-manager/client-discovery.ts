import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { DateTime } from 'luxon';

interface ClientInstance {
  id: string;
  proxy: ClientProxy;
  lastSeen: DateTime;
}

export class ClientDiscovery {
  private instances: ClientInstance[] = [];
  private timeoutInterval: NodeJS.Timeout;

  constructor(private readonly config: ConfigService) {
    this.start();
  }

  public destroy() {
    clearInterval(this.timeoutInterval);
  }

  private start() {
    this.timeoutInterval = setInterval(() => {
      this.instances = this.instances.filter((c) => {
        const diff = DateTime.utc().diff(c.lastSeen, 'seconds').seconds;
        return diff < 60;
      });
    }, 1000 * 30);
  }

  private createClientProxy(instanceId: string) {
    return ClientProxyFactory.create({
      transport: Transport.NATS,
      options: {
        servers: [this.config.get<string>('natsUri')],
        queue: instanceId,
        debug: true,
      },
    });
  }

  addClient(instanceId: string) {
    const client = this.instances.find((c) => c.id === instanceId);
    if (client) {
      client.lastSeen = DateTime.utc();
    } else {
      this.instances.push({
        id: instanceId,
        proxy: this.createClientProxy(instanceId),
        lastSeen: DateTime.utc(),
      });
    }
  }

  removeClient(clientId: string) {
    this.instances = this.instances.filter((c) => c.id !== clientId);
  }

  emitToAll(event: string, data: any) {
    this.instances.forEach((client) => {
      client.proxy.emit(event, data);
    });
  }

  emitToClient(clientId: string, event: string, data: any) {
    const client = this.instances.find((c) => c.id === clientId);
    if (client) {
      client.proxy.emit(event, data);
    }
  }
}
