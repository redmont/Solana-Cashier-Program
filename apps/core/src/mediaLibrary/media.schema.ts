import { Schema } from 'dynamoose';

export const MediaSchema = new Schema({
  // Folder path
  pk: {
    type: String,
    hashKey: true,
  },
  // File name
  sk: {
    type: String,
    rangeKey: true,
  },
  mimeType: String,
});
