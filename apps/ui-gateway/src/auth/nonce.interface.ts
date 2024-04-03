import { Key } from "src/interfaces/key";

export interface Nonce extends Key {
  timestamp: string;
}
