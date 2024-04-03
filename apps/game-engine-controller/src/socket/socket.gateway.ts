import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Observable } from "rxjs";

@WebSocketGateway()
export class SocketGateway {
  @WebSocketServer()
  server: any;

  // Message type is irrelevant
  // as we're using a custom
  // implementation of the adapter
  @SubscribeMessage("")
  onEvent(client: any, data: any): Observable<any> {
    console.log(data);
    return data;
  }
}
