import { Key } from './key.interface';

export interface Tournament extends Key {
  displayName: string;
  description: string;
  startDate: string;
  endDate: string;
  prizes: {
    title: string;
    description: string;
  }[];
}
