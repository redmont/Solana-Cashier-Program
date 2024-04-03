import { Controller, Inject } from "@nestjs/common";
import { ClientProxy, MessagePattern, Payload } from "@nestjs/microservices";
import { MatchService } from "./match.service.js";
import { catchError, firstValueFrom, map, throwError, timeout } from "rxjs";

interface PlaceBetPayload {
  userId: string;
  walletAddress: string;
  amount: number;
  fighter: string;
}

@Controller()
export class MatchController {
  bets = [];

  constructor(
    @Inject("UI_CLIENTS_REDIS") private redisClient: ClientProxy,
    private service: MatchService
  ) {}

  @MessagePattern("matchManager.placeBet")
  async handleBetPlaced(@Payload() data: PlaceBetPayload) {
    console.log("Got betPlaced on match-manager", data);

    const result = await firstValueFrom(
      this.redisClient
        .send("cashier.debit", {
          accountId: data.userId,
          amount: data.amount,
        })
        .pipe(
          timeout(30000),
          map((response: any) => {
            if (response.error) {
              console.log("Cashier debit error!", response);
              return response;
            }
            console.log("Cashier debit success!", response);
            // Success...
            this.service.placeBet(
              data.userId,
              data.walletAddress,
              data.amount,
              data.fighter
            );

            this.redisClient.emit("bets", this.service.currentMatch.bets);

            return response;
          }),
          catchError((error) => {
            // Error...

            return throwError(() => new Error(error));
          })
        )
    );

    return result;
  }
}
