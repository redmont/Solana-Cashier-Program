import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Model } from 'nestjs-dynamoose';
import { JWT_AUTH_SERVICE } from '@/jwtAuth/jwtAuth.constants';
import { IJwtAuthService } from '@/jwtAuth/jwtAuth.interface';
import { Nonce } from './nonce.interface';
import { Key } from '@/interfaces/key';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { UserProfilesQueryStoreService } from 'query-store';
import dayjs from '@/dayjs';
import { v4 as uuid } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let configService: ConfigService;
  let nonceModel: Model<Nonce, Key>;
  let jwtAuthService: IJwtAuthService;
  let broker: NatsJetStreamClientProxy;
  let userProfilesQueryStore: UserProfilesQueryStoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(300000), // Mock the nonce TTL as 5 minutes
          },
        },
        {
          provide: 'nonceModel',
          useValue: {
            create: jest.fn(),
            get: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: JWT_AUTH_SERVICE,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: NatsJetStreamClientProxy,
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: UserProfilesQueryStoreService,
          useValue: {
            setUserProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
    nonceModel = module.get<Model<Nonce, Key>>('nonceModel');
    jwtAuthService = module.get<IJwtAuthService>(JWT_AUTH_SERVICE);
    broker = module.get<NatsJetStreamClientProxy>(NatsJetStreamClientProxy);
    userProfilesQueryStore = module.get<UserProfilesQueryStoreService>(
      UserProfilesQueryStoreService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNonceMessage', () => {
    it('should generate a nonce and return a message to sign', async () => {
      const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';
      const nonce = 'test-nonce';
      uuid.mockReturnValue(nonce);

      const expectedMessage = `Welcome to Brawlers!\nSign this message to continue.\n\n${nonce.replace(/-/g, '')}`;

      const result = await service.getNonceMessage(walletAddress);

      expect(nonceModel.create).toHaveBeenCalledWith({
        pk: `nonce#${walletAddress.toLowerCase()}`,
        sk: nonce.replace(/-/g, ''),
        timestamp: expect.any(String),
      });
      expect(result).toEqual(expectedMessage);
    });
  });

  describe('getToken', () => {
    it('should throw an error if the signature is invalid', async () => {
      const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';
      const message = `Welcome to Brawlers!\nSign this message to continue.\n\ntest-nonce`;
      const signedMessage = '0xsignedmessage';
      const username = 'testuser';

      jest
        .spyOn(service, 'getToken')
        .mockRejectedValue(new Error('Invalid signature'));

      expect(async () => {
        await service.getToken(walletAddress, message, signedMessage, username);
      }).rejects.toThrow('Invalid signature');
    });

    it('should throw an error if nonce entry is not found', async () => {
      const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';
      const message = `Welcome to Brawlers!\nSign this message to continue.\n\ntest-nonce`;
      const signedMessage = '0xsignedmessage';
      const username = 'testuser';

      jest
        .spyOn(service, 'getToken')
        .mockRejectedValue(new Error('Invalid signature'));
      nonceModel.get = jest.fn().mockResolvedValue(null);

      expect(async () => {
        await service.getToken(walletAddress, message, signedMessage, username);
      }).rejects.toThrow('Invalid signature');
    });
  });
});
