import { Key } from './key.interface';

export interface Roster extends Key {
  roster: {
    codeName: string;
  }[];
}
