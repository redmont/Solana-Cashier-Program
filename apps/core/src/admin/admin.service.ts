import { Injectable } from '@nestjs/common';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { sendBrokerMessage } from 'broker-comms';
import {
  CreditByWalletAddressMessage as CreditMessage,
  CreditByWalletAddressMessageResponse as CreditMessageResponse,
  DebitByWalletAddressMessage as DebitMessage,
  DebitByWalletAddressMessageResponse as DebitMessageResponse,
} from 'cashier-messages';

@Injectable()
export class AdminService {
  constructor(private readonly broker: NatsJetStreamClientProxy) {}

  async processPointsBalancesUpload(file: Express.Multer.File) {
    const fileData = file.buffer.toString();

    const lines = fileData.split('\n');

    const items = lines.map((line) => {
      const [walletAddress, amount] = line.split(',');

      return { walletAddress, amount: parseInt(amount, 10) };
    });

    let credits = 0;
    let debits = 0;
    const errors = [];

    for (const item of items) {
      if (item.amount > 0) {
        try {
          await sendBrokerMessage<CreditMessage, CreditMessageResponse>(
            this.broker,
            new CreditMessage(item.walletAddress, item.amount, 'IMPORT'),
          );
          credits++;
        } catch (e) {
          errors.push({
            ...e,
            walletAddress: item.walletAddress,
            amount: item.amount,
            type: 'credit',
          });
        }
      } else if (item.amount < 0) {
        try {
          await sendBrokerMessage<DebitMessage, DebitMessageResponse>(
            this.broker,
            new DebitMessage(
              item.walletAddress,
              Math.abs(item.amount),
              'IMPORT',
            ),
          );
          debits++;
        } catch (e) {
          errors.push({
            ...e,
            walletAddress: item.walletAddress,
            amount: item.amount,
            type: 'debit',
          });
        }
      }
    }

    return { credits, debits, errors };
  }
}
