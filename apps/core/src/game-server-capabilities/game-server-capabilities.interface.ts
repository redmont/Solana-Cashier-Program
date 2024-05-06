import { Key } from 'src/interfaces/key';

export interface GameServerCapabilities extends Key {
  headModels: string[];
  torsoModels: string[];
  legModels: string[];
  finishingMoves: string[];
  levels: string[];
}
