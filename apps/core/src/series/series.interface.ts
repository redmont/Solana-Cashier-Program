import { Key } from 'src/interfaces/key';

export interface Series extends Key {
  displayName: string;
  betPlacementTime: number;
  fighters: {
    codeName: string;
    displayName: string;
    ticker: string;
    model: {
      head: string;
      torso: string;
      legs: string;
    };
  }[];
  level: string;
  state?: string;
  context?: any;
}
