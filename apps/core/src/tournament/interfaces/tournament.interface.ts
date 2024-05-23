import { Key } from 'src/interfaces/key';

export interface Tournament extends Key {
  displayName: string;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  prizes: {
    title: string;
    description: string;
  }[];
}
