export interface CreateSeriesRequest {
  codeName: string;
  displayName: string;
  betPlacementTime: number;
  preMatchVideoPath: string;
  preMatchDelay: number;
  fighters: {
    codeName: string;
    displayName: string;
    ticker: string;
    imagePath: string;
    model: {
      head: string;
      torso: string;
      legs: string;
    };
  }[];
  level: string;
  fightType: string;
}
