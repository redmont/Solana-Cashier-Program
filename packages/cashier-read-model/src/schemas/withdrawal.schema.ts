import { Schema } from 'dynamoose';

const WithdrawalSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
    index: {
      name: 'pkCreatedAt',
      rangeKey: 'createdAt',
      type: 'global',
      project: true,
    },
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  accountId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: String,
    required: true,
  },
  updatedAt: String,
  creditAmount: Number,
  chainId: {
    type: String,
    required: true,
  },
  signature: String,
  tokenSymbol: String,
  tokenAmount: String,
  tokenDecimals: Number,
  validFrom: String,
  validTo: String,
  transactionHash: String,
  status: {
    type: String,
    index: {
      name: 'statusSk',
      rangeKey: 'sk',
      type: 'global',
      project: true,
    },
  },
  itemType: {
    type: String,
    required: true,
    index: {
      name: 'itemTypeCreatedAt',
      rangeKey: 'createdAt',
      type: 'global',
      project: true,
    },
  },
});

export { WithdrawalSchema };
