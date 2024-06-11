import { Logger } from '@nestjs/common';
import { setup, assign, assertEvent } from 'xstate';
import { MatchSetup } from './models/matchSetup';
import { ServerMessage } from './models/serverMessage';
import { ServerCapabilities } from './models/serverCapabilities';
import { FightType } from './models/fightType';

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

type SendMatchSetupEvent = {
  type: 'SEND_MATCH_SETUP';
  params: {
    matchId: string;
    matchParameters: MatchParameters;
  };
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
        | SendMatchSetupEvent
        | OutcomeSentEvent
        | ReadyEvent
        | MatchCompletionEvent;
    },
    actions: {
      sendMatchDetails: async ({ context, event }) => {
        assertEvent(event, 'SEND_MATCH_SETUP');
        const { matchId, matchParameters } = event.params;

        await sendMessage<MatchSetup>({
          serverId: context.serverId,
          payload: new MatchSetup(
            matchId,
            matchParameters.startTime,
            matchParameters.fighters,
            matchParameters.level,
            matchParameters.fightType,
          ),
        });
      },
    },
  }).createMachine({
    id: `gameServer-${serverId}`,
    initial: 'ready',
    context: { serverId, capabilities, matchId: null, matchConfig: null },
    states: {
      ready: {
        on: {
          SEND_MATCH_SETUP: {
            actions: [
              'sendMatchDetails',
              assign(({ event }) => {
                return { matchId: event.params.matchId };
              }),
            ],
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
      },
    },
  });
};
