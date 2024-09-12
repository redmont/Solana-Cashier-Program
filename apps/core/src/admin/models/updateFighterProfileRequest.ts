export class UpdateFighterProfileRequest {
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
