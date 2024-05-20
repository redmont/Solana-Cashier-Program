import { WsAdapter } from '@nestjs/platform-ws';
import { MessageMappingProperties } from '@nestjs/websockets';
import { EMPTY, Observable } from 'rxjs';

export class GameServerWsAdapter extends WsAdapter {
  override bindMessageHandler(
    buffer: any,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ): Observable<any> {
    const message = JSON.parse(buffer.data);
    const messageHandler = handlers[0];
    if (!messageHandler) {
      return EMPTY;
    }
    return process(messageHandler.callback(message));
  }
}
