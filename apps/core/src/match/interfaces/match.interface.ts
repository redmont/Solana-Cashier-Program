import { Key } from 'src/interfaces/key';

export interface Match extends Key {
  seriesCodeName: string;
  state?: string;
  startTime: string;
  context?: any;
}
