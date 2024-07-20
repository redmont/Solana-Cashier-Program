import { fromPromise } from 'xstate';
import { v4 as uuid } from 'uuid';
import dayjs from '@/dayjs';
import { FSMDependencies } from './fsmDependencies';
import { SeriesConfig } from '../seriesConfig.model';
import { SeriesContext } from './seriesContext';
import { MatchState } from './matchState';

export const getActors = ({
  logger,
  getSeriesConfig,
  setCurrentMatchId,
  allocateServerForMatch,
  determineOutcome,
  distributeWinnings,
  resetBets,
  onStateChange,
  matchCompleted,
}: FSMDependencies) => ({
  getSeriesConfig: fromPromise<
    SeriesConfig,
    { codeName: string; fighterCodeNames: string[] }
  >(async ({ input }) => {
    const { codeName, fighterCodeNames } = input;
    return await getSeriesConfig(codeName, fighterCodeNames);
  }),
  generateMatchId: fromPromise<string, string>(async ({ input: codeName }) => {
    const matchId = uuid();

    setCurrentMatchId(codeName, matchId);

    return matchId;
  }),
  allocateServerForMatch: fromPromise<
    {
      serverId: string;
      capabilities: {
        finishingMoves: string[];
        models: {
          head: string[];
          torso: string[];
          legs: string[];
        };
        levels: string[];
      };
      streamId: string;
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
    {
      displayName: string;
      codeName: string;
      priceDelta: Record<string, { relative: number; absolute: number }>;
    },
    {
      serverId: string;
      capabilities: {
        finishingMoves: string[];
        models: {
          head: string[];
          torso: string[];
          legs: string[];
        };
        levels: string[];
      };
      matchId: string;
      config: SeriesConfig;
      samplingStartTime: string;
    }
  >(async ({ input }) => {
    return await determineOutcome(
      input.serverId,
      input.capabilities,
      input.matchId,
      input.config,
      input.samplingStartTime,
    );
  }),
  setStartTime: fromPromise<
    { poolOpenStartTime: string; startTime: string },
    number
  >(async ({ input: betPlacementTime }) => ({
    poolOpenStartTime: dayjs.utc().toISOString(),
    startTime: dayjs.utc().add(betPlacementTime, 'seconds').toISOString(),
  })),
  distributeWinnings: fromPromise<
    void,
    {
      codeName: string;
      matchId: string;
      winningFighter: {
        displayName: string;
        codeName: string;
      };
      priceDelta: Record<
        string,
        {
          relative: number;
          absolute: number;
        }
      >;
      config: SeriesConfig;
      startTime: string;
    }
  >(
    async ({
      input: {
        codeName,
        matchId,
        winningFighter,
        priceDelta,
        config,
        startTime,
      },
    }) => {
      await distributeWinnings(
        codeName,
        matchId,
        winningFighter,
        priceDelta,
        config,
        startTime,
      );
    },
  ),
  resetBets: fromPromise<void, string>(async ({ input }) => {
    await resetBets(input);
  }),
  onStateChange: fromPromise<
    void,
    { state: MatchState; context: SeriesContext }
  >(async ({ input }) => {
    await onStateChange(input.state, input.context);
  }),
  matchCompleted: fromPromise<void, void>(() => matchCompleted()),
});
