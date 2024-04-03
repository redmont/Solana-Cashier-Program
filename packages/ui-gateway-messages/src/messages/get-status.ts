import { Message } from "./message";

export class GetStatusMessage extends Message<{
  bets: any[];
  startTime: string;
  state: string;
  success: boolean;
}> {
  static messageType = "getStatus";
  constructor() {
    super();
  }
}
