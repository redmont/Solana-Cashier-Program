import { Key } from 'src/interfaces/key';

export interface StreamToken extends Key {
  expiresAt: string;
  tokenId: string;
  token: string;
}
