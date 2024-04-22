import { BrokerMessage, BaseResponse } from 'broker-comms';
import { prefix } from '../constants';

export type GameServerDisconnectedMessageResponse = BaseResponse;

export class GameServerDisconnectedMessage extends BrokerMessage<GameServerDisconnectedMessageResponse> {
  static messageType = `${prefix}.gameServerDisconnected`;
  constructor(public readonly matchId: string) {
    super();
  }
}
