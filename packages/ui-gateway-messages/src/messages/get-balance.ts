import { Message } from "./message";

export class GetBalanceMessage extends Message<{
  balance: number;
  success: boolean;
}> {
  static messageType = "getBalance";
  constructor() {
    super();
  }
}
