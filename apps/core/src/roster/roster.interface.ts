import { Key } from 'src/interfaces/key';

export interface Roster extends Key {
  scheduleType: string;
  series: {
    codeName: string;
  }[];
  schedule: {
    codeName: string;
    fighters: {
      codeName: string;
      displayName: string;
      imagePath: string;
    }[];
  }[];
  timedSeries: {
    codeName: string;
    startTime: string;
  }[];
}
