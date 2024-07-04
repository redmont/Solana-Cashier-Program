import { Key } from './key.interface';

export interface Tournament extends Key {
  displayName: string;
  description: string;
  startDate: string;
  endDate: string;
  currentRound: number;
  prizes: {
    title: string;
    description: string;
  }[];
}
