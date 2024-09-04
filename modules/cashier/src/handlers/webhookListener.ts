import { Handler, LambdaFunctionURLEvent } from 'aws-lambda';
import { stringToBytes, keccak256 } from 'viem';
import { validateBody } from '../alchemy/webhookValidator';
import { connect } from 'nats';
import {
  DiscoverInstancesCommand,
  ServiceDiscoveryClient,
} from '@aws-sdk/client-servicediscovery';

const initialNatsInstanceIps = process.env.NATS_INSTANCE_IPS?.split(',') ?? [];
const serviceDiscoveryNamespaceName =
  process.env.SERVICE_DISCOVERY_NAMESPACE_NAME!;
const serviceDiscoveryServiceNames =
  process.env.SERVICE_DISCOVERY_SERVICE_NAMES?.split(',') ?? [];
const alchemyWebhookSigningKeys =
  process.env.ALCHEMY_WEBHOOK_SIGNING_KEYS?.split(',') ?? [];

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

const topicHash = keccak256(
  stringToBytes('DepositReceived(bytes32,address,uint256)'),
);

interface Log {
  topics: string[];
  data: string;
}

interface AlchemyWebhookPayload {
  event: {
    data: {
      block: {
        logs: {
          transaction: {
            hash: string;
            logs: {
              topics: string[];
              data: string;
            }[];
          };
        }[];
      };
    };
  };
}

export const handler: Handler = async (event: LambdaFunctionURLEvent) => {
  if (!event.body) {
    throw new Error('No body provided');
  }

  if (!event.headers['x-alchemy-signature']) {
    // Invalid request
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request' }),
    };
  }

  const valid = validateBody(
    event.body,
    event.headers['x-alchemy-signature'],
    alchemyWebhookSigningKeys,
  );

  if (!valid) {
    // Invalid request
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request' }),
    };
  }

  console.log('Received valid request', event.body);

  const request = JSON.parse(event.body) as AlchemyWebhookPayload;
  const transactions = request.event.data.block.logs.map((x) => x.transaction);

  for (const transaction of transactions) {
    const log = transaction.logs.find((x: Log) => x.topics[0] === topicHash);
    if (log) {
      const { topics, data } = log;

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

      await js.publish(
        'cashier.chainEvent',
        JSON.stringify({ transactionHash: transaction.hash, topics, data }),
      );

      console.log(`Published event to NATS (cashier.chainEvent)`, {
        topics,
        data,
      });
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
  };
};
