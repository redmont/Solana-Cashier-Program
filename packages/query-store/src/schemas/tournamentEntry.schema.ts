import { Schema } from 'dynamoose';

export const TournamentEntrySchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
    index: [
      {
        name: 'pkTournamentEntryWinAmount',
        rangeKey: 'tournamentEntryWinAmount',
        type: 'global',
        project: [
          'sk',
          'primaryWalletAddress',
          'tournamentEntryWinAmount',
          'balance',
          'xp',
        ],
      },
      {
        name: 'pkTournamentEntryXp',
        rangeKey: 'xp',
        type: 'global',
        project: [
          'sk',
          'primaryWalletAddress',
          'tournamentEntryWinAmount',
          'balance',
          'xp',
        ],
      },
    ],
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  primaryWalletAddress: String,
  tournamentEntryWinAmount: Number,
  balance: String,
  xp: Number,
});
