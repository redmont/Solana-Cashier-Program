class SeriesConfigCapabilities {
  public models?: {
    head?: string[];
    torso?: string[];
    legs?: string[];
  };
  public map?: string;
  public finishingMoves?: string[];
}

export class SeriesConfigFighter {
  public displayName: string;
  public codeName: string;
  public ticker: string;
  public imagePath: string;
  public model: {
    head: string;
    torso: string;
    legs: string;
  };
}

/**
 * Represents the configuration for a series.
 */
export class SeriesConfig {
  /**
   * The required capabilities for the series.
   */
  public requiredCapabilities: SeriesConfigCapabilities;

  /**
   * The fighters participating in the series.
   */
  public fighters: SeriesConfigFighter[];

  /**
   * The time allowed for placing bets on the series.
   */
  public betPlacementTime: number;

  /**
   * The level used for the series.
   */
  public level: string;
}
