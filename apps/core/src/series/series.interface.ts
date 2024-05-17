import { Key } from 'src/interfaces/key';

export interface Series extends Key {
  displayName: string;
  betPlacementTime: number;
  preMatchVideoPath: string;
  preMatchDelay: number;
  fighters: {
    codeName: string;
    displayName: string;
    ticker: string;
    imagePath: string;
    model: {
      head: string;
      torso: string;
      legs: string;
    };
  }[];
  level: string;
  fightType: string;
  state?: string;
  context?: any;
}
