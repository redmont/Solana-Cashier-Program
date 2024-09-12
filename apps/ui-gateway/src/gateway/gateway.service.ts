import { Injectable } from '@nestjs/common';
import { ReadModelService } from 'cashier-read-model';

@Injectable()
export class GatewayService {
  constructor(private readonly cashierReadModel: ReadModelService) {}

  getBalance(accountId: string) {
    return this.cashierReadModel.getAccountBalance(accountId);
  }

  getWithdrawals(userId: string) {
    return this.cashierReadModel.getWithdrawals(userId);
  }
}
