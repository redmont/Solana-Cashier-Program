import { Message } from './message';

export interface PlaceBetMessageResponse {
  success: boolean;
  message: string;
}

export class PlaceBetMessage extends Message<PlaceBetMessageResponse> {
  static messageType = 'placeBet';
  constructor(
    public readonly series: string,
    public readonly amount: number,
    public readonly fighter: string,
    public readonly vip: boolean,
  ) {
    super();
  }
}
