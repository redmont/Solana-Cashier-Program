import { Key } from 'src/interfaces/key';

export interface Series extends Key {
  displayName: string;
  betPlacementTime: number;
  preMatchVideoPath: string;
  preMatchDelay: number;
  fighterProfiles: string[];
  level: string;
  fightType: string;
  state?: string;
  context?: any;
}
