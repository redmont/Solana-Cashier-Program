import { Handler, LambdaFunctionURLEvent } from 'aws-lambda';
import { WebhookRequest } from './models/webhookRequest';
import { connect } from 'nats';
import {
  DiscoverInstancesCommand,
  ServiceDiscoveryClient,
} from '@aws-sdk/client-servicediscovery';
import { QuestSucceededEventData } from './models/webhookRequestData';

const serviceDiscoveryNamespaceName =
  process.env.SERVICE_DISCOVERY_NAMESPACE_NAME!;
const serviceDiscoveryServiceNames =
  process.env.SERVICE_DISCOVERY_SERVICE_NAMES!.split(',');
const zealyWebhookSecret = process.env.ZEALY_WEBHOOK_SECRET!;

let natsInstanceIps: string[] = [];

const client = new ServiceDiscoveryClient({
  region: 'ap-southeast-1',
  logger: console,
});

const resolveNatsIps = async () => {
  // Clear existing NATS instance IPs
  natsInstanceIps = [];

  for (const serviceName of serviceDiscoveryServiceNames) {
    const serviceDiscovery = await client.send(
      new DiscoverInstancesCommand({
        NamespaceName: serviceDiscoveryNamespaceName,
        ServiceName: serviceName,
        HealthStatus: 'ALL',
      }),
    );

    const natsInstanceIp =
      serviceDiscovery.Instances?.[0].Attributes?.AWS_INSTANCE_IPV4;

    if (natsInstanceIp) {
      natsInstanceIps.push(natsInstanceIp);
    }
  }
};

const getNatsConnection = async () => {
  if (natsInstanceIps.length > 0) {
    try {
      return await connect({ servers: natsInstanceIps });
    } catch (error) {
      console.error('Failed to connect to NATS', error);
    }
  }

  await resolveNatsIps();

  if (natsInstanceIps.length > 0) {
    try {
      return await connect({ servers: natsInstanceIps });
    } catch (error) {
      console.error('Failed to connect to NATS', error);
    }
  }
  return null;
};

export const handler: Handler = async (event: LambdaFunctionURLEvent) => {
  if (!event.body) {
    throw new Error('No body provided');
  }

  const request = JSON.parse(event.body) as WebhookRequest;

  // Validate webhook secret
  if (request.secret !== zealyWebhookSecret) {
    console.warn('Received request with invalid webhook secret');

    // Invalid request
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request' }),
    };
  }

  const nc = await getNatsConnection();
  if (!nc) {
    console.error('Failed to connect to NATS');
    // Respond with 500
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }

  const js = nc.jetstream();

  const questData = request.data as QuestSucceededEventData;

  const ethereumAddress = questData.user.addresses['ethereum'];
  const xp = questData.quest.xp;
  const timestamp = request.secret;

  await js.publish(
    'zealy.questCompletedEvent',
    JSON.stringify({ timestamp, ethereumAddress, xp }),
  );
};
