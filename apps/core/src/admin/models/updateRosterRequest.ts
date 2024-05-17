export interface UpdateRosterRequest {
  scheduleType?: string;
  series?: string[];
  schedule?: string[];
  timedSeries?: {
    codeName: string;
    startTime: string;
  }[];
}
