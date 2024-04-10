import { Inject, Injectable } from "@nestjs/common";
import { MatchConfig } from "./series.service";
import { ClientProxy } from "@nestjs/microservices";
import { catchError, firstValueFrom, map, throwError, timeout } from "rxjs";

@Injectable()
export class MatchDataService {
  constructor(@Inject("BROKER_REDIS") private redisClient: ClientProxy) {}

  async allocateServerForMatch(
    matchId: string,
    matchConfig: MatchConfig
  ): Promise<{ serverId: string }> {
    console.log("Match Data Service allocating server for match...");
    const result = await firstValueFrom(
      this.redisClient
        .send("game-engine.allocateServer", {
          matchId,
          matchConfig,
        })
        .pipe(
          timeout(30000),
          map((response: any) => {
            console.log("Got response", response);
            // Todo - error handling
            return response;
          }),
          catchError((error) => {
            // Error...

            return throwError(() => new Error(error));
          })
        )
    );

    console.log("Got result", result);

    return { serverId: result.serverId };
  }
}
