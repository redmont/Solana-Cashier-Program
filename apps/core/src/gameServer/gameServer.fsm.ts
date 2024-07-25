import { Logger } from '@nestjs/common';
import { setup, fromPromise } from 'xstate';
import { ServerMessage } from './models/serverMessage';
import { ServerCapabilities } from './models/serverCapabilities';
import { FightType } from './models/fightType';
import { Error } from './models/error';

export interface MatchParameters {
  startTime: string;
  fighters: {
    id: number;
    model: {
      head: string;
      torso?: string;
      legs?: string;
    };
    displayName: string;
  }[];
  level: string;
  fightType: FightType;
}

type MatchSetupSentEvent = {
  type: 'MATCH_SETUP_SENT';
};

type OutcomeSentEvent = {
  type: 'OUTCOME_SENT';
};

type ReadyEvent = {
  type: 'READY';
};

type MatchCompletionEvent = {
  type: 'MATCH_COMPLETED';
};

export const createGameServerFSM = (
  serverId: string,
  capabilities: ServerCapabilities,
  sendMessage: <T extends ServerMessage>(data: {
    serverId: string;
    payload: T;
  }) => Promise<void>,
  logger: Logger,
) => {
  return setup({
    types: {} as {
      events:
        | MatchSetupSentEvent
        | OutcomeSentEvent
        | ReadyEvent
        | MatchCompletionEvent;
    },
    actors: {
      forceReset: fromPromise<void, string>(async ({ input: serverId }) => {
        console.log('Sending reset message to server');
        await sendMessage<Error>({
          serverId,
          payload: new Error(),
        });
      }),
    },
  }).createMachine({
    id: `gameServer-${serverId}`,
    initial: 'ready',
    context: { serverId, capabilities, matchId: null, matchConfig: null },
    states: {
      ready: {
        on: {
          MATCH_SETUP_SENT: {
            target: 'waitingToStart',
          },
          READY: 'ready',
        },
      },
      waitingToStart: {
        on: {
          OUTCOME_SENT: {
            target: 'matchInProgress',
          },
        },
      },
      matchInProgress: {
        on: {
          MATCH_COMPLETED: 'waitingForReady',
          READY: 'ready',
        },
      },
      waitingForReady: {
        on: {
          READY: 'ready',
        },
        after: {
          60_000: 'forceReset',
        },
      },
      forceReset: {
        invoke: {
          src: 'forceReset',
          input: ({ context }) => context.codeName,
          onDone: {
            target: 'waitingForReady',
          },
        },
      },
    },
  });
};
