import { SeriesConfig } from '../series-config.model';
import { ServerCapabilities } from './server-capabilities';

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
