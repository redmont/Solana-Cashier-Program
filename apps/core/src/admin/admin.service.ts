import { Injectable, Logger } from '@nestjs/common';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { sendBrokerCommand } from 'broker-comms';
import {
  CreditMessage,
  CreditMessageResponse,
  DebitMessage,
  DebitMessageResponse,
} from 'cashier-messages';
import { UsersService } from '@/users/users.service';
import { getAddress } from 'viem';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly broker: NatsJetStreamClientProxy,
    private readonly usersService: UsersService,
  ) {}

  async processPointsBalancesUpload(file: Express.Multer.File) {
    const fileData = file.buffer.toString();

    const lines = fileData.split('\n');

    const items = lines.map((line) => {
      const [walletAddress, amount, vip] = line.split(',');

      return {
        walletAddress,
        amount: parseInt(amount, 10),
        vip: vip?.toLowerCase() === 'true',
      };
    });

    let credits = 0;
    let debits = 0;
    const errors = [];

    for (const item of items) {
      if (item.amount > 0) {
        try {
          const formattedAddress = item.walletAddress.startsWith('0x')
            ? getAddress(item.walletAddress)
            : item.walletAddress;

          // Check if user exists
          let userId =
            await this.usersService.getUserIdByWalletAddress(formattedAddress);
          if (!userId) {
            const user = await this.usersService.createUser(formattedAddress);
            userId = user.userId;
          }

          const result = await sendBrokerCommand<
            CreditMessage,
            CreditMessageResponse
          >(
            this.broker,
            new CreditMessage(userId, item.amount, 'IMPORT', item.vip),
          );

          if (!result.success) {
            this.logger.warn(
              `Error crediting user via cashier broker message, '${item.walletAddress}' with amount '${item.amount}'`,
              result.message,
            );

            errors.push(
              result.message,
              formattedAddress,
              item.amount,
              'credit',
            );
          } else {
            credits++;
          }
        } catch (e) {
          this.logger.warn(
            `Error crediting user '${item.walletAddress}' with amount '${item.amount}'`,
            e,
          );

          errors.push({
            ...e,
            walletAddress: item.walletAddress,
            amount: item.amount,
            type: 'credit',
          });
        }
      } else if (item.amount < 0) {
        try {
          const formattedAddress = getAddress(item.walletAddress);

          // Check if user exists
          let userId =
            await this.usersService.getUserIdByWalletAddress(formattedAddress);
          if (!userId) {
            const user = await this.usersService.createUser(formattedAddress);
            userId = user.userId;
          }

          const result = await sendBrokerCommand<
            DebitMessage,
            DebitMessageResponse
          >(
            this.broker,
            new DebitMessage(userId, Math.abs(item.amount), 'IMPORT', item.vip),
          );
          if (!result.success) {
            this.logger.warn(
              `Error debiting user via cashier broker message, '${item.walletAddress}' with amount '${item.amount}'`,
              result.message,
            );

            errors.push(result.message, formattedAddress, item.amount, 'debit');
          } else {
            debits++;
          }
        } catch (e) {
          this.logger.warn(
            `Error debiting user '${item.walletAddress}' with amount '${item.amount}'`,
            e,
          );

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
