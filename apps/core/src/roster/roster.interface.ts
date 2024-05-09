import { Key } from 'src/interfaces/key';

export interface Roster extends Key {
  scheduleType: string;
  series: {
    codeName: string;
  }[];
  schedule: {
    codeName: string;
  }[];
}
