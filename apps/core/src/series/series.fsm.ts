import { Logger } from '@nestjs/common';
import { setup, fromPromise, assign } from 'xstate';
import { DateTime } from 'luxon';
import { v4 as uuid } from 'uuid';
import { SeriesConfig } from './series-config.model';

interface ServerCapabilities {
  finishingMoves: string[];
  models: {
    head: string;
    torso: string;
    legs: string;
  }[];
}

export interface SeriesContext {
  codeName: string;
  config: SeriesConfig;
  startTime: DateTime | null;
  matchId: string;
  serverId: string;
  capabilities: ServerCapabilities;
  winningFighter: string;
}

export interface FSMDependencies {
  logger: Logger;
  setCurrentMatchId: (codeName: string, matchId: string) => void;
  allocateServerForMatch: (
    matchId: string,
    config: SeriesConfig,
  ) => Promise<{
    serverId: string;
    capabilities: ServerCapabilities;
    streamUrl: string;
  } | null>;
  determineOutcome: (
    serverId: string,
    capabilities: ServerCapabilities,
    matchId: string,
    config: SeriesConfig,
  ) => Promise<string>;
  distributeWinnings: (
    matchId: string,
    winningFighter: string,
  ) => Promise<void>;
  resetBets: (codeName: string) => Promise<void>;
  onStateChange: (state: string, context: SeriesContext) => Promise<void>;
}

export type SeriesEvent =
  | 'RUN'
  | 'RUN_MATCH.FINISH_MATCH'
  | 'MATCH_CREATED'
  | 'MATCH_COMPLETED'
  | 'RETRY_ALLOCATION'
  | 'REOPEN_BETTING';

type InternalEvent = { type: SeriesEvent };

export function createSeriesFSM(
  codeName: string,
  {
    logger,
    setCurrentMatchId,
    allocateServerForMatch,
    determineOutcome,
    distributeWinnings,
    resetBets,
    onStateChange,
  }: FSMDependencies,
) {
  return setup({
    types: {} as {
      context: SeriesContext;
      events: InternalEvent;
    },
    actors: {
      generateMatchId: fromPromise<string, string>(
        async ({ input: codeName }) => {
          console.log('Generating match ID');
          const matchId = uuid();

          console.log(`Code name '${codeName}', matchId '${matchId}'`);
          setCurrentMatchId(codeName, matchId);

          return matchId;
        },
      ),
      allocateServerForMatch: fromPromise<
        {
          serverId: string;
          capabilities: {
            finishingMoves: string[];
            models: {
              head: string;
              torso: string;
              legs: string;
            }[];
          };
          streamUrl: string;
        },
        { matchId: string; config: SeriesConfig }
      >(async ({ input }) => {
        const serverDetails = await allocateServerForMatch(
          input.matchId,
          input.config,
        );
        if (!serverDetails) {
          throw new Error('No server available');
        }

        return serverDetails;
      }),
      determineOutcome: fromPromise<
        string,
        {
          serverId: string;
          capabilities: {
            finishingMoves: string[];
            models: {
              head: string;
              torso: string;
              legs: string;
            }[];
          };
          matchId: string;
          config: SeriesConfig;
        }
      >(async ({ input }) => {
        return await determineOutcome(
          input.serverId,
          input.capabilities,
          input.matchId,
          input.config,
        );
      }),
      setStartTime: fromPromise<DateTime, number>(
        async ({ input: betPlacementTime }) => {
          const startTime = DateTime.utc().plus({ seconds: betPlacementTime });
          console.log('Setting start time to', startTime);

          return startTime;
        },
      ),
      distributeWinnings: fromPromise<
        void,
        { matchId: string; winningFighter: string }
      >(async ({ input: { matchId, winningFighter } }) => {
        await distributeWinnings(matchId, winningFighter);
      }),
      resetBets: fromPromise<void, string>(async ({ input }) => {
        await resetBets(input);
      }),
      onStateChange: fromPromise<
        void,
        { state: string; context: SeriesContext }
      >(async ({ input }) => {
        await onStateChange(input.state, input.context);
      }),
    },
    delays: {
      BETTING_OPEN_TIME: ({ context }) => {
        return context.config.betPlacementTime * 1000;
      },
    },
    guards: {
      canRerunMatch: () => true,
    },
  }).createMachine({
    id: 'series',
    initial: 'idle',
    context: {
      codeName,
      config: {
        requiredCapabilities: {},
        betPlacementTime: 20,
        fighters: [
          {
            displayName: 'Doge',
            codeName: 'doge',
            model: {
              head: 'H_DogeA',
              torso: 'T_DogeA',
              legs: 'L_DogeA',
            },
          },
          {
            displayName: 'Pepe',
            codeName: 'pepe',
            model: {
              head: 'H_PepeA',
              torso: 'T_PepeA',
              legs: 'L_PepeA',
            },
          },
        ],
      },
      matchId: null,
      serverId: null,
      startTime: null,
      capabilities: null,
      winningFighter: null,
    },
    states: {
      idle: {
        on: {
          RUN: 'runMatch',
        },
      },
      runMatch: {
        initial: 'resetBets',
        states: {
          resetBets: {
            invoke: {
              src: 'resetBets',
              input: ({ context }) => context.codeName,
              onDone: 'setMatchId',
            },
          },
          setMatchId: {
            initial: 'onStateChange',
            states: {
              onStateChange: {
                invoke: {
                  src: 'onStateChange',
                  input: ({ context }) => ({ state: 'pendingStart', context }),
                  onDone: 'generateMatchId',
                },
              },
              generateMatchId: {
                invoke: {
                  src: 'generateMatchId',
                  input: ({ context }) => context.codeName,
                  onDone: {
                    target: 'done',
                    actions: assign({
                      matchId: ({ event }) => event.output,
                    }),
                  },
                },
              },
              done: {
                type: 'final',
              },
            },
            onDone: {
              target: 'serverAllocation',
            },
          },
          serverAllocation: {
            invoke: {
              id: 'allocateServer',
              src: 'allocateServerForMatch',
              input: ({ context }) => ({
                matchId: context.matchId,
                config: context.config,
              }),
              onDone: {
                target: 'bettingOpen',
                actions: assign({
                  serverId: ({ event }) => event.output.serverId,
                  capabilities: ({ event }) => event.output.capabilities,
                }),
              },
              onError: {
                target: 'retryAllocation',
              },
            },
          },
          retryAllocation: {
            on: {
              RETRY_ALLOCATION: 'serverAllocation',
            },
            after: {
              10_000: { target: 'serverAllocation' },
            },
          },
          bettingOpen: {
            initial: 'setStartTime',
            states: {
              setStartTime: {
                invoke: {
                  src: 'setStartTime',
                  input: ({ context: { config } }) => config.betPlacementTime,
                  onDone: {
                    target: 'onStateChange',
                    actions: assign({
                      startTime: ({ event }) => event.output,
                    }),
                  },
                },
              },
              onStateChange: {
                invoke: {
                  src: 'onStateChange',
                  input: ({ context }) => ({ state: 'bettingOpen', context }),
                  onDone: 'done',
                },
              },
              done: {
                type: 'final',
              },
            },
            on: {
              REOPEN_BETTING: '.setStartTime',
            },
            after: {
              BETTING_OPEN_TIME: 'bettingClosed',
            },
          },
          bettingClosed: {
            initial: 'onStateChange',
            states: {
              onStateChange: {
                invoke: {
                  src: 'onStateChange',
                  input: ({ context }) => ({
                    state: 'matchInProgress',
                    context,
                  }),
                  onDone: 'determineOutcome',
                },
              },
              determineOutcome: {
                invoke: {
                  src: 'determineOutcome',
                  input: ({
                    context: { serverId, capabilities, matchId, config },
                  }) => ({
                    serverId,
                    capabilities,
                    matchId,
                    config,
                  }),
                  onDone: {
                    target: 'done',
                    actions: assign({
                      winningFighter: ({ event }) => event.output,
                    }),
                  },
                },
              },
              done: {
                type: 'final',
              },
            },
            onDone: 'matchInProgress',
          },
          matchInProgress: {
            on: {
              'RUN_MATCH.FINISH_MATCH': 'distributeWinnings',
            },
          },
          distributeWinnings: {
            initial: 'onStateChange',
            states: {
              onStateChange: {
                invoke: {
                  src: 'onStateChange',
                  input: ({ context }) => ({
                    state: 'matchFinished',
                    context,
                  }),
                  onDone: 'distributeWinnings',
                },
              },
              distributeWinnings: {
                invoke: {
                  src: 'distributeWinnings',
                  input: ({ context: { matchId, winningFighter } }) => ({
                    matchId,
                    winningFighter,
                  }),
                  onDone: 'done',
                },
              },
              done: {
                type: 'final',
              },
            },
            onDone: 'matchFinished',
          },
          matchFinished: {
            type: 'final',
          },
        },
        onDone: {
          target: 'checkReRunCondition',
        },
      },
      checkReRunCondition: {
        always: [
          // Conditional transition using a guard to check if the series should continue
          { target: 'runMatchAfterDelay', guard: 'canRerunMatch' },
          // Default transition if no conditions above are met
          { target: 'idle' },
        ],
      },
      runMatchAfterDelay: {
        on: {
          RUN: 'runMatch',
        },
        after: {
          10_000: 'runMatch',
        },
      },
    },
  });
}
