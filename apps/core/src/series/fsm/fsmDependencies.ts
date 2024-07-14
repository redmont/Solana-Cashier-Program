import { Logger } from '@nestjs/common';
import { SeriesConfig } from '../seriesConfig.model';
import { ServerCapabilities } from '@/gameServer/models/serverCapabilities';
import { SeriesContext } from './seriesContext';
import { MatchState } from './matchState';

export interface FSMDependencies {
  logger: Logger;
  getSeriesConfig: (
    codeName: string,
    fighterCodeNames: string[],
  ) => Promise<SeriesConfig>;
  setCurrentMatchId: (codeName: string, matchId: string) => void;
  allocateServerForMatch: (
    matchId: string,
    config: SeriesConfig,
  ) => Promise<{
    serverId: string;
    capabilities: ServerCapabilities;
    streamId: string;
  } | null>;
  determineOutcome: (
    serverId: string,
    capabilities: ServerCapabilities,
    matchId: string,
    config: SeriesConfig,
    samplingStartTime: string,
  ) => Promise<{ codeName: string; displayName: string }>;
  distributeWinnings: (
    codeName: string,
    matchId: string,
    winningFighter: {
      displayName: string;
      codeName: string;
    },
    config: SeriesConfig,
    startTime: string,
  ) => Promise<void>;
  resetBets: (codeName: string) => Promise<void>;
  onStateChange: (state: MatchState, context: SeriesContext) => Promise<void>;
  matchCompleted: () => Promise<void>;
}
