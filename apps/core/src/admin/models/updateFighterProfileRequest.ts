export class UpdateFighterProfileRequest {
  displayName: string;
  imagePath: string;
  model: {
    head: string;
    torso: string;
    legs: string;
  };
  ticker: string;
  tokenAddress: string;
  tokenChainId: string;
  enabled: boolean;
  showOnRoster: boolean;
}
