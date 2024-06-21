import { Handler, LambdaFunctionURLEvent } from 'aws-lambda';
import { stringToBytes, keccak256 } from 'viem';
import { validateBody } from '../alchemy/webhookValidator';
import { connect } from 'nats';
import {
  DiscoverInstancesCommand,
  ServiceDiscoveryClient,
} from '@aws-sdk/client-servicediscovery';

const alchemyWebhookSigningKey = process.env.ALCHEMY_WEBHOOK_SIGNING_KEY!;
const serviceDiscoveryServiceId = process.env.SERVICE_DISCOVERY_SERVICE_ID!;

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

const client = new ServiceDiscoveryClient({
  region: 'ap-southeast-1',
  logger: console,
});

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
    alchemyWebhookSigningKey,
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
  const logs = request.event.data.block.logs.flatMap((x) => x.transaction.logs);

  const log = logs.find((x: Log) => x.topics[0] === topicHash);
  if (log) {
    const { topics, data } = log;

    const serviceDiscovery = await client.send(
      new DiscoverInstancesCommand({
        NamespaceName: 'brawl.dev.local',
        ServiceName: 'nats',
        HealthStatus: 'ALL',
      }),
    );

    console.log('Service discovery response', serviceDiscovery);

    const natsInstanceIp =
      serviceDiscovery.Instances?.[0].Attributes?.AWS_INSTANCE_IPV4;

    if (!natsInstanceIp) {
      throw new Error('NATS instance IP could not be resolved');
    }

    console.log('Got NATS instance IP', natsInstanceIp);

    const nc = await connect({ servers: natsInstanceIp });
    const js = nc.jetstream();

    await js.publish('cashier.chainEvent', JSON.stringify({ topics, data }));
  }
};
