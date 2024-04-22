import { Key } from 'src/interfaces/key';

export interface ActivityStreamItem extends Key {
  activity: string;
  data: any;
}
