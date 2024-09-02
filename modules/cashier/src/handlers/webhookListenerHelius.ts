import { Handler, LambdaFunctionURLEvent } from 'aws-lambda';
import { connect, JSONCodec } from 'nats';
import {
  DiscoverInstancesCommand,
  ServiceDiscoveryClient,
} from '@aws-sdk/client-servicediscovery';

const initialNatsInstanceIps = process.env.NATS_INSTANCE_IPS?.split(',') ?? [];
const serviceDiscoveryNamespaceName =
  process.env.SERVICE_DISCOVERY_NAMESPACE_NAME!;
const serviceDiscoveryServiceNames =
  process.env.SERVICE_DISCOVERY_SERVICE_NAMES?.split(',') ?? [];

const heliusWebhookSecret = process.env.HELIUS_SECRET_KEY!;

let natsInstanceIps: string[] = [];

const client = new ServiceDiscoveryClient({
  region: 'ap-southeast-1',
  logger: console,
});

const resolveNatsIps = async () => {
  // Clear existing NATS instance IPs
  natsInstanceIps = [...initialNatsInstanceIps];

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

interface TokenTransfer {
  fromUserAccount: string;
  tokenAmount: number;
}

interface HeliusWebhookPayload {
  tokenTransfers: TokenTransfer[];
}

export const handler: Handler = async (event: LambdaFunctionURLEvent) => {
  try {
    if (!event.body || !event.headers['authorization']) {
      // Invalid request
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request' }),
      };
    }

    // Validate that the request is coming from Helius
    if (event.headers['authorization'] !== heliusWebhookSecret) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request authorization' }),
      };
    }

    const request = JSON.parse(event.body) as HeliusWebhookPayload;

    // Extract tokenTransfers data
    const { tokenTransfers } = request[0];

    if (tokenTransfers && tokenTransfers.length > 0) {
      const nc = await getNatsConnection();
      if (!nc) {
        console.error('Failed to connect to NATS');
        // Respond with 500
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Internal server error' }),
        };
      }

      // Publish each token transfer to NATS
      for (const transfer of tokenTransfers) {
        const { fromUserAccount, tokenAmount } = transfer;
        const eventJSON = {
          fromUserAccount,
          tokenAmount,
        };
        const jc = JSONCodec();
        const encodedJSON = jc.encode(eventJSON);

        await nc.publish('cashier.chainEventSolana', encodedJSON);
        console.log(`Published event to NATS (cashier.chainEvent)`, eventJSON);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error processing webhook', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
