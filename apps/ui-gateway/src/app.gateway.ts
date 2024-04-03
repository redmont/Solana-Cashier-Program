import { Inject, UseGuards } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from "@nestjs/websockets";
import { firstValueFrom, from, Observable, throwError } from "rxjs";
import { catchError, map, timeout } from "rxjs/operators";
import { Server, Socket } from "socket.io";
import { AppService } from "./app.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import {
  PlaceBetMessage,
  GetBalanceMessage,
  GetStatusMessage,
} from "ui-gateway-messages";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class AppGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject("BROKER_REDIS") private redisClient: ClientProxy,
    private service: AppService
  ) {
    // this.matchesService.onBroadcast.subscribe((event: string, message: any) => {
    //   this.server.emit(event, message);
    // });
  }

  @SubscribeMessage("matches")
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: "matches", data: item }))
    );
  }

  @SubscribeMessage("identity")
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }

  @SubscribeMessage(GetStatusMessage.messageType)
  public async status() {
    return {
      bets: this.service.bets,
      startTime: this.service.startTime,
      state: this.service.state,
      success: true,
    };
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage(PlaceBetMessage.messageType)
  public async placeBet(
    @MessageBody() data: { amount: number; fighter: string },
    @ConnectedSocket() client: Socket
  ) {
    console.log("Got placeBet, sending to Redis...", client.data);

    const result = await firstValueFrom(
      this.redisClient
        .send("matchManager.placeBet", {
          userId: client.data.authorizedUser.sub,
          walletAddress: client.data.authorizedUser.claims.walletAddress,
          amount: data.amount,
          fighter: data.fighter,
        })
        .pipe(
          timeout(30000),
          map((response: any) => {
            console.log("UI gateway - place bet success!", response);
            // Success...
            return response;
          }),
          catchError((error) => {
            // Error...

            return throwError(() => new Error(error));
          })
        )
    );

    return { ...result, success: true };
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage(GetBalanceMessage.messageType)
  public async getBalance(@ConnectedSocket() client: Socket) {
    const result = await firstValueFrom(
      this.redisClient
        .send("cashier.getBalance", {
          accountId: client.data.authorizedUser.sub,
        })
        .pipe(
          timeout(30000),
          map((response: any) => {
            console.log("Success!", response);
            // Success...
            return response;
          }),
          catchError((error) => {
            // Error...

            return throwError(() => new Error(error));
          })
        )
    );

    return { ...result, success: true };
  }

  public publish(event, data) {
    this.server.emit(event, data);
  }
}
