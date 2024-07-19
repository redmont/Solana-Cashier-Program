import { SchemaDefinition } from 'dynamoose/dist/Schema';

export const KeySchema: SchemaDefinition = {
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true,
  },
};
