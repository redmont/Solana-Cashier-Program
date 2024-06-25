export interface CreateSeriesRequest {
  codeName: string;
  displayName: string;
  betPlacementTime: number;
  preMatchVideoPath: string;
  preMatchDelay: number;
  fighterProfiles: string[]; 
  level: string;
  fightType: string;
}
