import { Logger } from '@nestjs/common';
import { setup, assign, assertEvent } from 'xstate';
import { MatchSetup } from './models/match-setup';
import { MatchOutcome } from './models/match-outcome';
import { ServerMessage } from './models/server-message';
import { ServerCapabilities } from './models/server-capabilities';

interface MatchParameters {
  startTime: string;
  fighters: {
    id: number;
    model: {
      head: string;
      torso: string;
      legs: string;
    };
    displayName: string;
  }[];
}

type SendMatchSetupEvent = {
  type: 'SEND_MATCH_SETUP';
  params: {
    matchId: string;
    matchParameters: MatchParameters;
  };
};

type SendOutcomeEvent = {
  type: 'SEND_OUTCOME';
  params: {
    outcome: {
      id: number;
      health: number;
      finishingMove: string;
    }[];
  };
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
  eventEmitter: <T extends ServerMessage>(data: {
    serverId: string;
    payload: T;
  }) => void,
  logger: Logger,
) => {
  return setup({
    types: {} as {
      events:
        | SendMatchSetupEvent
        | SendOutcomeEvent
        | ReadyEvent
        | MatchCompletionEvent;
    },
    actions: {
      sendMatchDetails: ({ context, event }) => {
        assertEvent(event, 'SEND_MATCH_SETUP');
        const { matchId, matchParameters } = event.params;

        logger.verbose("Sending 'matchSetup' message to game server", event);

        eventEmitter<MatchSetup>({
          serverId: context.serverId,
          payload: new MatchSetup(
            matchId,
            matchParameters.startTime,
            matchParameters.fighters,
          ),
        });
      },
      sendOutcomeToServer: ({ context, event }) => {
        assertEvent(event, 'SEND_OUTCOME');
        eventEmitter<MatchOutcome>({
          serverId: context.serverId,
          payload: new MatchOutcome(context.matchId, event.params.outcome),
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
          SEND_OUTCOME: {
            actions: 'sendOutcomeToServer',
            target: 'matchInProgress',
          },
        },
      },
      matchInProgress: {
        on: {
          MATCH_COMPLETED: 'ready',
          READY: 'ready',
        },
      },
    },
  });
};
