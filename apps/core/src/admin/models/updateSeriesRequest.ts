export interface UpdateSeriesRequest {
  displayName: string;
  betPlacementTime: number;
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
}
