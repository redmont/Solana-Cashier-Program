import { Message } from "./message";

export class PlaceBetMessage extends Message<{ success: boolean }> {
  static messageType = "placeBet";
  constructor(
    public readonly amount: number,
    public readonly fighter: string
  ) {
    super();
  }
}
