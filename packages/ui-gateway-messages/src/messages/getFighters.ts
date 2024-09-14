import { Message, MessageResponse } from './message';

export interface GetFightersMessageResponse extends MessageResponse {
  success: boolean;
  fighters: {
    codeName: string;
    displayName: string;
    imageUrl: string;
    fightCount: number;
    winningFightCount: number;
    wageredSum: number;
  }[];
}

export class GetFightersMessage extends Message<GetFightersMessageResponse> {
  static messageType = 'getFighters';

  static responseType: GetFightersMessageResponse;

  constructor() {
    super();
  }
}
