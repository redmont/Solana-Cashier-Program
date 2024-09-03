import { Injectable } from '@nestjs/common';
import { InjectModel, Model, ObjectType } from 'nestjs-dynamoose';
import { v4 as uuid } from 'uuid';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { User, UserWallet } from './users.interface';
import { Key } from 'src/interfaces/key';
import { sendBrokerCommand } from 'broker-comms';
import {
  EnsureAccountExistsMessage,
  EnsureAccountExistsMessageResponse,
} from 'cashier-messages';

export class UserCreatedEvent {
  public userId: string;
  public primaryWalletAddress: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('user')
    private readonly userModel: Model<User, Key>,
    @InjectModel('userWallet')
    private readonly userWalletModel: Model<UserWallet, Key>,
    private readonly broker: NatsJetStreamClientProxy,
  ) {}

  getUserById(id: string) {
    return this.userModel.get({ pk: `user#${id}`, sk: `user` });
  }

  async getAllUserIds(startKey?: ObjectType): Promise<{
    userIds: string[];
    lastKey?: ObjectType;
  }> {
    // Query users
    let usersQuery = this.userModel.query({ sk: 'user' }).using('skUserId');

    if (startKey) {
      usersQuery = usersQuery.startAt(startKey);
    }

    const users = await usersQuery.exec();

    return {
      lastKey: users.lastKey,
      userIds: users.map((user) => user.userId),
    };
  }

  async getUserIdByWalletAddress(walletAddress: string) {
    const userWallet = await this.userWalletModel
      .query('pk')
      .eq(`wallet#${walletAddress}`)
      .exec();

    if (userWallet.length === 0) {
      return null;
    }

    return userWallet[0].sk;
  }

  async getUserByWalletAddress(walletAddress: string) {
    const user = await this.userModel
      .query('ethereumWalletAddress')
      .eq(walletAddress)
      .exec();

    return user.length === 0 ? null : user[0];
  }

  async createUser(walletAddress: string) {
    const id = uuid().replace(/-/g, '');

    const user: User = {
      pk: `user#${id}`,
      sk: `user`,
      userId: id,
      ethereumWalletAddress: walletAddress,
      totalNetBetAmount: 0,
      totalNetBetAmountCreditedXp: 0,
      matchCount: 0,
      xp: 0,
      totalBetAmount: 0,
    };

    const createdUser = await this.userModel.create(user);

    const wallet: UserWallet = {
      pk: `wallet#${walletAddress}`,
      sk: id,
    };

    await this.userWalletModel.create(wallet);

    await sendBrokerCommand<
      EnsureAccountExistsMessage,
      EnsureAccountExistsMessageResponse
    >(this.broker, new EnsureAccountExistsMessage(id, walletAddress));

    // Todo - delete user if account creation fails

    return createdUser;
  }

  async creditXp(userId: string, netBetAmount: number): Promise<number> {
    const updatedUser = await this.userModel.update(
      {
        pk: `user#${userId}`,
        sk: 'user',
      },
      {
        $ADD: {
          totalNetBetAmount: netBetAmount,
        },
      },
      {
        return: 'item',
        returnValues: 'ALL_NEW',
      },
    );

    const creditsPerXp = 10_000;
    let xp = 0;

    const betAmountsToProcess =
      updatedUser.totalNetBetAmount -
      (updatedUser.totalNetBetAmountCreditedXp ?? 0);
    if (betAmountsToProcess > 0) {
      // Credit 1 XP per creditsPerXp bet amount
      xp = Math.floor(betAmountsToProcess / creditsPerXp);
      if (xp > 0) {
        await this.userModel.update(
          {
            pk: `user#${userId}`,
            sk: 'user',
          },
          {
            $ADD: {
              xp: xp,
              totalNetBetAmountCreditedXp: xp * creditsPerXp,
            },
          },
        );
      }
    }

    return xp;
  }
}
