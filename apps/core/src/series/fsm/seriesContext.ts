import { SeriesConfig } from '../seriesConfig.model';
import { ServerCapabilities } from './serverCapabilities';

export interface SeriesContext {
  codeName: string;
  displayName: string;
  config: SeriesConfig;
  startTime: string;
  matchId: string;
  serverId: string;
  capabilities: ServerCapabilities;
  samplingStartTime: string;
  winningFighter?: {
    displayName: string;
    codeName: string;
  };
}
