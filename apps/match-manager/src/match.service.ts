import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { DateTime } from "luxon";
import { ClientProxy } from "@nestjs/microservices";
import { Match } from "./interfaces/match.interface.js";

@Injectable()
export class MatchService implements OnModuleInit {
  public currentMatch?: Match;
  private readonly matches: Match[] = [];

  constructor(@Inject("UI_CLIENTS_REDIS") private redisClient: ClientProxy) {}

  create(match: Match) {
    this.matches.push(match);

    this.redisClient.emit("matchStatus", {
      state: match.state,
      startTime: match.startTime.toISO(),
      bets: match.bets,
    });

    setTimeout(() => {
      match.state = "InProgress";

      this.redisClient.emit("matchStatus", {
        state: match.state,
        bets: match.bets,
      });

      setTimeout(() => {
        match.state = "Completed";

        const fighter1Wins = Math.random() > 0.5;
        const fighter2Wins = Math.random() > 0.5;

        let outcome;
        if (fighter1Wins && fighter2Wins) {
          outcome = "Draw";
        } else if (fighter1Wins) {
          outcome = "Doge";
        } else if (fighter2Wins) {
          outcome = "Pepe";
        } else {
          outcome = "Technical Draw";
        }

        const totalBets = match.bets.reduce((acc, bet) => acc + bet.amount, 0);

        match.bets.forEach((bet) => {
          let winAmount = 0;
          if (fighter1Wins && fighter2Wins) {
            // Return the bet amount, minus 5% house fee
            winAmount = bet.amount * 0.95;
          } else if (bet.fighter === "Doge" && fighter1Wins) {
            // Win amount will be the share of the total bets, proportional to the amount bet, plus the original bet
            winAmount = (bet.amount / totalBets) * totalBets + bet.amount;
          } else if (bet.fighter === "Pepe" && fighter2Wins) {
            winAmount = (bet.amount / totalBets) * totalBets + bet.amount;
            return;
          }

          if (winAmount > 0) {
            this.redisClient.emit("cashier.credit", {
              accountId: bet.userId,
              amount: winAmount,
            });
          }
        });

        this.redisClient.emit("matchStatus", {
          state: match.state,
          bets: match.bets,
          outcome,
        });

        setTimeout(() => {
          this.createMatch();
        }, 10_000);
      }, 30_000);
    }, 30_000);

    this.currentMatch = match;
  }

  findAll(): Match[] {
    return this.matches;
  }

  onModuleInit() {
    this.createMatch();
  }

  createMatch() {
    this.create({
      state: "AcceptingBets",
      bets: [],
      startTime: DateTime.utc().plus({ seconds: 30 }),
    });
  }

  public placeBet(
    userId: string,
    walletAddress: string,
    amount: number,
    fighter: string
  ) {
    if (!this.currentMatch) {
      throw new Error("No match is currently active");
    }

    if (this.currentMatch.state !== "AcceptingBets") {
      throw new Error("Match is not accepting bets");
    }

    // Place the bet
    this.currentMatch.bets.push({
      userId,
      fighter,
      walletAddress,
      amount,
    });
  }
}
