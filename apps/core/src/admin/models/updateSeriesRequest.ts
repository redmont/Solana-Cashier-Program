export interface UpdateSeriesRequest {
  displayName: string;
  betPlacementTime: number;
  preMatchVideoPath: string;
  preMatchDelay: number;
  fighterProfiles: string[];
  level: string;
  fightType: string;
}
