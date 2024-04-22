import { Key } from 'src/interfaces/key';

export interface Series extends Key {
  displayName: string;
  state?: string;
  context?: any;
}
