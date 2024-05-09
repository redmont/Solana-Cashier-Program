import { ConfigService } from '@nestjs/config';
import dayjs from '@/dayjs';
import { ClientDiscovery } from './client-discovery';

describe('ClientDiscovery', () => {
  it('should filter instances that have not been seen in the last 60 seconds', () => {
    jest.useFakeTimers();

    const configService = new ConfigService();
    const clientDiscovery = new ClientDiscovery(configService);

    // Add instances to the clientDiscovery
    clientDiscovery.addClient('instance1');
    clientDiscovery.addClient('instance2');
    clientDiscovery.addClient('instance3');

    // Set the lastSeen time of instance1 and instance2 to be more than 60 seconds ago
    clientDiscovery['instances'][0].lastSeen = dayjs
      .utc()
      .subtract(61, 'seconds');
    clientDiscovery['instances'][1].lastSeen = dayjs
      .utc()
      .subtract(61, 'seconds');

    // Advance time 40 seconds
    jest.advanceTimersByTime(1000 * 40);

    // Call the start method
    (clientDiscovery as any).start();

    // Check that instance1 and instance2 have been filtered out
    expect(clientDiscovery['instances'].length).toBe(1);
    expect(clientDiscovery['instances'][0].id).toBe('instance3');

    jest.useRealTimers();
  });
});
