import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import {
  AttributeValue,
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { stringify } from 'csv-stringify/sync';

interface Metadata {
  LastRunTimestamp: string;
}

interface MatchItem {
  matchId: string;
  startTime: string;
  fighters: {
    betCount: number;
    codeName: string;
    ticker: string;
  }[];
  winner: {
    codeName: string;
  };
  winnerTokenPriceDelta: {
    absolute: number;
    relative: number;
  };
  loserTokenPriceDelta: {
    absolute: number;
    relative: number;
  };
}

const region = 'ap-southeast-1';

const s3Client = new S3Client({ region });
const ddbClient = new DynamoDBClient({ region });

const bucketName = process.env.BUCKET_NAME!;
const coreTableName = process.env.CORE_TABLE_NAME!;

const formatMatchFighters = (fighterCodeNames: string[]): string => {
  return fighterCodeNames.map((codeName) => codeName.toLowerCase()).join('#');
};

export const handler = async () => {
  // Try and get metadata file
  const metadataKey = 'metadata.json';

  let lastItemTimestamp: string | null = null;
  try {
    const metadata = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: metadataKey,
      }),
    );

    console.log('Attempted to retrieve metadata file');

    // If the metadata file exists, parse it
    if (metadata.Body) {
      const metadataBody = metadata.Body.toString();
      const metadataJson = JSON.parse(metadataBody) as Metadata;
      lastItemTimestamp = metadataJson.LastRunTimestamp;
    }
  } catch (e) {
    console.warn('Error retrieving metadata', e);
  }

  const queryCommandInput: Required<
    Pick<
      QueryCommandInput,
      | 'KeyConditionExpression'
      | 'ExpressionAttributeNames'
      | 'ExpressionAttributeValues'
    >
  > = {
    KeyConditionExpression: '#pk = :pk',
    ExpressionAttributeNames: {
      '#pk': 'pk',
    },
    ExpressionAttributeValues: marshall({
      ':pk': 'match',
    }),
  };
  if (lastItemTimestamp) {
    queryCommandInput.KeyConditionExpression = '#pk = :pk AND #sk > :sk';
    queryCommandInput.ExpressionAttributeNames['#sk'] = 'sk';
    queryCommandInput.ExpressionAttributeValues[':sk'] =
      marshall(lastItemTimestamp);
  }

  // Get all items from the table
  let lastEvaluatedKey: Record<string, AttributeValue> | undefined = undefined;
  let items: MatchItem[] = [];
  do {
    const result = await ddbClient.send(
      new QueryCommand({
        TableName: coreTableName,
        ExclusiveStartKey: lastEvaluatedKey,
        ...queryCommandInput,
      }),
    );

    lastEvaluatedKey = result.LastEvaluatedKey;

    if (result.Items) {
      items.push(...result.Items.map((item) => unmarshall(item) as MatchItem));
    }
  } while (lastEvaluatedKey);

  // Group matches by hour, considering startTime is an ISO8601 string
  const matchesByHour: Record<string, MatchItem[]> = {};
  for (const item of items) {
    const startTime = new Date(item.startTime);
    const hour = startTime.toISOString().slice(0, 13);
    if (!matchesByHour[hour]) {
      matchesByHour[hour] = [];
    }
    matchesByHour[hour].push(item);
  }

  // For each hour, write the matches to S3.
  // Except for the last hour, which we ignore as we don't know if it's complete.
  const hours = Object.keys(matchesByHour).sort();
  for (let i = 0; i < hours.length - 1; i++) {
    const hour = hours[i];
    const matches = matchesByHour[hour];

    const csv = stringify(
      matches.map((match) => ({
        matchId: match.matchId,
        startTime: match.startTime,
        fighter1: match.fighters[0].codeName,
        fighter1Ticker: match.fighters[0].ticker,
        fighter1BetCount: match.fighters[0].betCount,
        fighter2: match.fighters[1].codeName,
        fighter2Ticker: match.fighters[1].ticker,
        fighter2BetCount: match.fighters[1].betCount,
        matchFighters: formatMatchFighters(
          match.fighters.map((f) => f.codeName),
        ),
        winner: match.winner.codeName,
        winnerTokenPriceDeltaAbsolute:
          match.winnerTokenPriceDelta?.absolute ?? 0,
        loserTokenPriceDeltaAbsolute: match.loserTokenPriceDelta?.absolute ?? 0,
      })),
      {
        header: true,
      },
    );

    const key = `matches/${hour}.csv`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: csv,
      }),
    );
  }

  // Update the metadata file
  const newMetadata: Metadata = {
    LastRunTimestamp: hours[hours.length - 1],
  };
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: metadataKey,
      Body: JSON.stringify(newMetadata),
    }),
  );
};
