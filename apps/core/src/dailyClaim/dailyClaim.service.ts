import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { DailyClaimStatus } from './interfaces/dailyClaimStatus.interface';
import { Key } from '@/interfaces/key';
import { DailyClaimAmounts } from './interfaces/dailyClaimAmounts.interface';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { sendBrokerCommand } from 'broker-comms';
import { CreditMessage } from 'cashier-messages';
import dayjs from '@/dayjs';
import { ok, err, ResultAsync } from 'neverthrow';
import { QueryStoreService } from 'query-store';

interface ClaimStatus {
  streak: number;
  nextClaimDate: string;
  claimExpiryDate: string;
}

export enum ClaimError {
  InvalidClaimAmount = 'InvalidClaimAmount',
  ClaimTooSoon = 'ClaimTooSoon',
  ClaimExpired = 'ClaimExpired',
}

@Injectable()
export class DailyClaimService {
  constructor(
    @InjectModel('dailyClaimAmounts')
    private readonly dailyClaimAmountsModel: Model<DailyClaimAmounts, Key>,
    @InjectModel('dailyClaimStatus')
    private readonly dailyClaimStatusModel: Model<DailyClaimStatus, Key>,
    private readonly query: QueryStoreService,
    private readonly broker: NatsJetStreamClientProxy,
  ) {}

  private async getClaimStatus(userId: string): Promise<DailyClaimStatus> {
    return this.dailyClaimStatusModel.get({
      pk: 'dailyClaimStatus',
      sk: userId,
    });
  }

  async getDailyClaimAmounts(): Promise<DailyClaimAmounts> {
    return this.dailyClaimAmountsModel.get({
      pk: 'dailyClaimAmounts',
      sk: 'dailyClaimAmounts',
    });
  }

  async setDailyClaimAmounts(amounts: number[]): Promise<void> {
    await this.dailyClaimAmountsModel.update({
      pk: 'dailyClaimAmounts',
      sk: 'dailyClaimAmounts',
      dailyClaimAmounts: amounts,
    });

    await this.query.setDailyClaimAmounts(amounts);
  }

  async claim(
    userId: string,
    amount: number,
  ): Promise<ResultAsync<ClaimStatus, ClaimError>> {
    const claimAmounts = await this.dailyClaimAmountsModel.get({
      pk: 'dailyClaimAmounts',
      sk: 'dailyClaimAmounts',
    });

    let claimStatus = await this.getClaimStatus(userId);
    if (!claimStatus) {
      claimStatus = {
        pk: 'dailyClaimStatus',
        sk: userId,
        dailyClaimStreak: 0,
      };
    }

    // Get the indexes of the claim amounts that match the requested amount
    const claimAmountIndexes = claimAmounts.dailyClaimAmounts.reduce(function (
      acc,
      val,
      i,
    ) {
      if (val === amount) {
        acc.push(i);
      }
      return acc;
    }, []);

    // If there are no indexes, the amount is invalid
    if (claimAmountIndexes.length === 0) {
      return err(ClaimError.InvalidClaimAmount);
    }

    // Claim must not have expired.
    if (
      claimStatus.claimExpiryDate &&
      dayjs.utc().isAfter(dayjs.utc(claimStatus.claimExpiryDate))
    ) {
      // If the claim has expired, the claim amount must be the first in the list
      if (amount !== claimAmounts.dailyClaimAmounts[0]) {
        return err(ClaimError.ClaimExpired);
      }

      // We now treat this as a new claim streak
      claimStatus.dailyClaimStreak = 0;

      // If the claim is not expired, it must not be too soon to claim.
    } else if (
      claimStatus.nextClaimDate &&
      dayjs.utc().isBefore(dayjs.utc(claimStatus.nextClaimDate))
    ) {
      return err(ClaimError.ClaimTooSoon);
    }

    // If the streak is equal or greater to the length of the claim amounts,
    // the last claim amount will be repeated indefinitely
    if (claimStatus.dailyClaimStreak >= claimAmounts.dailyClaimAmounts.length) {
      // Amount must be correct (last claim amount)
      if (
        amount !==
        claimAmounts.dailyClaimAmounts[
          claimAmounts.dailyClaimAmounts.length - 1
        ]
      ) {
        return err(ClaimError.InvalidClaimAmount);
      }
      // Normal rule applies - must be the correct amount in correlation to the streak
    } else if (
      claimAmountIndexes.indexOf(claimStatus.dailyClaimStreak) === -1
    ) {
      // One of the indexes must be the current streak
      return err(ClaimError.InvalidClaimAmount);
    }

    const response = await sendBrokerCommand(
      this.broker,
      new CreditMessage(userId, amount, 'DAILY_CLAIM'),
    );

    if (response.success) {
      const nextClaimDate = dayjs.utc().add(1, 'day').toISOString();
      const claimExpiryDate = dayjs.utc().add(2, 'day').toISOString();

      claimStatus.dailyClaimStreak++;
      claimStatus.nextClaimDate = nextClaimDate;
      claimStatus.claimExpiryDate = claimExpiryDate;

      await this.dailyClaimStatusModel.update(claimStatus);
      await this.query.setDailyClaimStatus(userId, {
        dailyClaimStreak: claimStatus.dailyClaimStreak,
        nextClaimDate,
        claimExpiryDate
      });
    }

    const { dailyClaimStreak, nextClaimDate, claimExpiryDate } = claimStatus;
    return ok({ streak: dailyClaimStreak, nextClaimDate, claimExpiryDate });
  }
}
