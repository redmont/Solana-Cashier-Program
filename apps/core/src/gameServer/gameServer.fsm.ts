import { Logger } from '@nestjs/common';
import { setup, fromPromise, assign } from 'xstate';
import { ServerMessage } from './models/serverMessage';
import { ServerCapabilities } from './models/serverCapabilities';
import { FightType } from './models/fightType';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { sendGenericBrokerCommand } from 'broker-comms';

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
  matchId: string;
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

type ResetEvent = {
  type: 'RESET';
};

export const createGameServerFSM = (
  serverId: string,
  capabilities: ServerCapabilities,
  sendMessage: <T extends ServerMessage>(data: {
    serverId: string;
    payload: T;
  }) => Promise<void>,
  broker: NatsJetStreamClientProxy,
  logger: Logger,
) => {
  return setup({
    types: {} as {
      events:
        | MatchSetupSentEvent
        | OutcomeSentEvent
        | ReadyEvent
        | MatchCompletionEvent
        | ResetEvent;
    },
    actors: {
      forceReset: fromPromise<void, string>(async ({ input: serverId }) => {
        console.log('Sending reset message to server');

        try {
          await sendGenericBrokerCommand(
            broker,
            `gameEngineControl.${serverId}`,
            {
              commandName: 'reset',
              commandPayload: {},
            },
          );
        } catch (e) {
          logger.warn('Error sending reset message:', e);
        }
      }),
    },
  }).createMachine({
    id: `gameServer-${serverId}`,
    initial: 'ready',
    context: { serverId, capabilities, matchId: null, matchConfig: null },
    on: {
      RESET: '.forceReset',
    },
    states: {
      ready: {
        on: {
          MATCH_SETUP_SENT: {
            actions: assign({
              matchId: ({ event: { matchId } }) => matchId,
            }),
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
          90_000: 'forceReset',
        },
      },
      forceReset: {
        invoke: {
          src: 'forceReset',
          input: ({ context }) => context.serverId,
          onDone: {
            target: 'waitingForReady',
          },
        },
      },
    },
  });
};
