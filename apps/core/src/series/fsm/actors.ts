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
  getSeriesConfig: fromPromise<SeriesConfig, string>(async ({ input }) => {
    return await getSeriesConfig(input);
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
    { displayName: string; codeName: string },
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
  setStartTime: fromPromise<string, number>(
    async ({ input: betPlacementTime }) =>
      dayjs.utc().add(betPlacementTime, 'seconds').toISOString(),
  ),
  distributeWinnings: fromPromise<
    void,
    {
      codeName: string;
      matchId: string;
      winningFighter: {
        displayName: string;
        codeName: string;
      };
      config: SeriesConfig;
      startTime: string;
    }
  >(
    async ({
      input: { codeName, matchId, winningFighter, config, startTime },
    }) => {
      await distributeWinnings(
        codeName,
        matchId,
        winningFighter,
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
