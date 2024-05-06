export interface ServerCapabilities {
  finishingMoves: string[];
  models: {
    head: string[];
    torso: string[];
    legs: string[];
  };
  levels: string[];
}
