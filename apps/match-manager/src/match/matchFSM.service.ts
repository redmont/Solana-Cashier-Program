import { Injectable } from "@nestjs/common";
import { createMachine, createActor, fromPromise, assign } from "xstate";
import { MatchDataService } from "./matchData.service";
import { MatchConfig } from "./series.service";

@Injectable()
export class MatchFSMService {
  constructor(private matchDataService: MatchDataService) {}

  createMatchFSM(matchId: string, config: MatchConfig) {
    const matchFSM = createMachine(
      {
        id: "match",
        initial: "matchCreation",
        context: { matchId, config, serverId: null },
        states: {
          matchCreation: {
            on: { FIND_SERVER: "serverAllocation" },
          },
          serverAllocation: {
            invoke: {
              id: "allocateServer",
              src: "allocateServerForMatch",
              input: ({ context }) => ({
                matchId: context.matchId,
                config: context.config,
              }),
              onDone: {
                target: "bettingOpen",
                actions: assign({
                  serverId: ({ context, event }) => {
                    console.log("Assigning server ID", event.output);
                    return event.output;
                  },
                }),
              },
              onError: {
                target: "retryAllocation",
              },
            },
          },
          retryAllocation: {
            after: {
              10_000: { target: "serverAllocation" },
            },
          },
          bettingOpen: {
            on: {
              PLACE_BET: {
                actions: "placeBet",
              },
              CLOSE_BETS: "bettingClosed",
            },
          },
          bettingClosed: {
            invoke: {
              id: "determineOutcome",
              src: "determineOutcome",
              onDone: {
                target: "matchInProgress",
                actions: "sendOutcomeToServer",
              },
            },
          },
          matchInProgress: {
            on: {
              FINISH_MATCH: "matchFinished",
            },
          },
          matchFinished: {
            invoke: {
              id: "distributeWinnings",
              src: "distributeWinnings",
              onDone: "matchCreation",
            },
          },
        },
      },
      {
        actors: {
          allocateServerForMatch: fromPromise<
            {},
            { matchId: string; config: MatchConfig }
          >(async (args) => {
            console.log("Attempting to allocate server");
            const { serverId } =
              await this.matchDataService.allocateServerForMatch(
                args.input.matchId,
                args.input.config
              );

            if (!serverId) {
              throw new Error("No server available");
            }

            return serverId;
          }),
        },
      }
    );

    return matchFSM;
  }
}
