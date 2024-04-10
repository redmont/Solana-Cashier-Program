import { createMachine, assign } from "xstate";

export const createGameServerFSM = (
  serverId: string,
  eventEmitter: (data: any) => void
) => {
  return createMachine(
    {
      id: `gameServer-${serverId}`,
      initial: "ready",
      context: { serverId, matchId: null },
      states: {
        ready: {
          on: {
            SEND_MATCH_SETUP: {
              target: "waitingToStart",
              actions: [
                "sendMatchDetails",
                assign(({ event }) => {
                  return { matchId: event.matchId };
                }),
              ],
            },
            READY: "ready",
          },
        },
        waitingToStart: {
          on: {
            SEND_OUTCOME: {
              target: "matchInProgress",
              actions: "sendOutcomeToServer",
            },
          },
        },
        matchInProgress: {
          on: { NOTIFY_MATCH_COMPLETION: "matchCompleted" },
        },
        matchCompleted: {
          on: { RESET: "ready" },
        },
      },
    },
    {
      actions: {
        sendMatchDetails: ({ context, event }) => {
          eventEmitter({
            serverId: context.serverId,
            payload: { type: "matchSetup", matchId: event.matchId },
          });
        },
        sendOutcomeToServer: ({ context }) => {
          eventEmitter({
            serverId: context.serverId,
            payload: { type: "matchOutcome", matchId: context.matchId },
          });
        },
      },
    }
  );
};
