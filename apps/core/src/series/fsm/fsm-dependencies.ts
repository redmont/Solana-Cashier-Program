import { Logger } from '@nestjs/common';
import { SeriesConfig } from '../series-config.model';
import { ServerCapabilities } from '@/game-server/models/server-capabilities';
import { SeriesContext } from './series-context';

export interface FSMDependencies {
  logger: Logger;
  getSeriesConfig: (codeName: string) => Promise<SeriesConfig>;
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
  ) => Promise<void>;
  resetBets: (codeName: string) => Promise<void>;
  onStateChange: (state: string, context: SeriesContext) => Promise<void>;
  matchCompleted: () => Promise<void>;
}
