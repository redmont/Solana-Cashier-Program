import { setup, assign } from 'xstate';
import dayjs from '@/dayjs';
import { getActors } from './actors';
import { FSMDependencies } from './fsmDependencies';
import { SeriesContext } from './seriesContext';

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
  displayName: string,
  fsmDependencies: FSMDependencies,
) {
  return setup({
    types: {} as {
      context: SeriesContext;
      events: InternalEvent;
    },
    actors: getActors(fsmDependencies),
    delays: {
      BETTING_OPEN_TIME: ({ context }) => {
        return context.config.betPlacementTime * 1000;
      },
      PRE_MATCH_DELAY: ({ context }) => {
        return context.config.preMatchDelay * 1000;
      },
    },
  }).createMachine({
    id: 'series',
    initial: 'idle',
    context: {
      codeName,
      displayName,
      config: {
        requiredCapabilities: {},
        betPlacementTime: 30,
        preMatchVideoPath: '',
        preMatchDelay: 0,
        fighters: [],
        level: '',
        fightType: 'MMA',
      },
      matchId: null,
      serverId: null,
      poolOpenStartTime: null,
      startTime: null,
      samplingStartTime: null,
      capabilities: null,
      winningFighter: null,
    },
    states: {
      idle: {
        on: {
          RUN: 'getSeriesConfig',
        },
      },
      getSeriesConfig: {
        invoke: {
          src: 'getSeriesConfig',
          input: ({ context }) => context.codeName,
          onDone: {
            target: 'preMatchDelay',
            actions: assign({
              config: ({ event }) => event.output,
            }),
          },
        },
      },
      preMatchDelay: {
        after: {
          PRE_MATCH_DELAY: 'runMatch',
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
                      startTime: ({ event }) => event.output.startTime,
                      poolOpenStartTime: ({ event }) => event.output.poolOpenStartTime
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
                    state: 'pollingPrices',
                    context,
                  }),
                  onDone: {
                    actions: assign({
                      samplingStartTime: () => dayjs.utc().toISOString(),
                    }),
                  },
                },
                after: {
                  10_000: 'setMatchInProgress',
                },
              },
              setMatchInProgress: {
                invoke: {
                  src: 'onStateChange',
                  input: ({ context }) => ({
                    state: 'matchInProgress',
                    context,
                  }),
                  onDone: {
                    target: 'determineOutcome',
                  },
                },
              },
              determineOutcome: {
                invoke: {
                  src: 'determineOutcome',
                  input: ({
                    context: {
                      serverId,
                      capabilities,
                      matchId,
                      config,
                      samplingStartTime,
                    },
                  }) => ({
                    serverId,
                    capabilities,
                    matchId,
                    config,
                    samplingStartTime,
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
            on: {
              RUN: 'matchInProgress',
            },
            onDone: 'matchInProgress',
          },
          matchInProgress: {
            on: {
              'RUN_MATCH.FINISH_MATCH': 'distributeWinnings',
            },
            // Timeout, in case we never get a 'match finished' state from the game server
            after: {
              180_000: {
                target: 'distributeWinnings',
              },
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
                  input: ({
                    context: {
                      codeName,
                      matchId,
                      winningFighter,
                      config,
                      startTime,
                    },
                  }) => ({
                    codeName,
                    matchId,
                    winningFighter,
                    config,
                    startTime,
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
          target: 'postMatchDelay',
        },
      },
      postMatchDelay: {
        after: {
          5_000: 'matchCompleted',
        },
      },
      matchCompleted: {
        invoke: {
          src: 'matchCompleted',
          onDone: 'idle',
        },
      },
    },
  });
}
