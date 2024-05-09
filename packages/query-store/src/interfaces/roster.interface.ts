import { Key } from './key.interface';

export interface RosterModel extends Key {
  roster: {
    codeName: string;
  }[];
}
