import { Key } from 'src/interfaces/key';

export interface Tournament extends Key {
  displayName: string;
  description: string;
  startDate: string;
  endDate: string;
  rounds: number;
  currentRound: number;
  createdAt: string;
  updatedAt: string;
  prizes: {
    title: string;
    description: string;
    imagePath?: string;
  }[];
}
