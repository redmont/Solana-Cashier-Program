import { Key } from './key.interface';

export interface FighterProfile extends Key {
  codeName: string;
  displayName: string;
  imagePath: string;
  fightCount: number;
  winningFightCount: number;
  wageredSum: number;
  showOnRoster: boolean;
}
