import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { v4 as uuid } from 'uuid';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { User, UserWallet } from './users.interface';
import { Key } from 'src/interfaces/key';
import { sendBrokerCommand, sendBrokerMessage } from 'broker-comms';
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
}
