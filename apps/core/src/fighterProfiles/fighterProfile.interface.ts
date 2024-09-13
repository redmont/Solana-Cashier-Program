import { Key } from 'src/interfaces/key';

export interface FighterProfile extends Key {
  codeName: string;
  displayName: string;
  ticker: string;
  tokenAddress: string;
  tokenChainId: string;
  imagePath: string;
  model: {
    head: string;
    torso: string;
    legs: string;
  };
  enabled: boolean;
}
