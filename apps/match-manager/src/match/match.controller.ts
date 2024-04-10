import { Controller, Inject } from "@nestjs/common";
import { ClientProxy, MessagePattern, Payload } from "@nestjs/microservices";
import { MatchService } from "./match.service";
import { catchError, firstValueFrom, map, throwError, timeout } from "rxjs";
import { UsersService } from "../users/users.service";

interface PlaceBetPayload {
  userId: string;
  walletAddress: string;
  amount: number;
  fighter: string;
}

interface EnsureUserIdPayload {
  walletAddress: string;
}

@Controller()
export class MatchController {
  bets = [];

  constructor(
    @Inject("BROKER_REDIS") private redisClient: ClientProxy,
    private service: MatchService,
    private usersService: UsersService
  ) {}

  @MessagePattern("matchManager.ensureUserId")
  async handleEnsureUserId(@Payload() data: EnsureUserIdPayload) {
    const { walletAddress } = data;

    let userId =
      await this.usersService.getUserIdByWalletAddress(walletAddress);
    if (!userId) {
      const user = await this.usersService.createUser(walletAddress);
      userId = user.userId;
    }

    return { userId };
  }

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
