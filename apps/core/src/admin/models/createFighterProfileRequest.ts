export class CreateFighterProfileRequest {
  codeName: string;
  displayName: string;
  imagePath: string;
  model: {
    head: string;
    torso: string;
    legs: string;
  };
  ticker: string;
  enabled: boolean;
}
