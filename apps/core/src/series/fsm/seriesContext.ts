import { SeriesConfig } from '../seriesConfig.model';
import { ServerCapabilities } from './serverCapabilities';

export interface SeriesContext {
  codeName: string;
  displayName: string;
  fighterCodeNames: string[];
  config: SeriesConfig;
  poolOpenStartTime: string;
  startTime: string;
  matchId: string;
  serverId: string;
  streamId: string;
  capabilities: ServerCapabilities;
  samplingStartTime: string;
  winningFighter?: {
    displayName: string;
    codeName: string;
  };
}
