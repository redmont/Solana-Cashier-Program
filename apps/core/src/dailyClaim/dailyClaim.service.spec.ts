import dynamoose from 'dynamoose';
import { ClaimError, DailyClaimService } from './dailyClaim.service';
import { DailyClaimStatusSchema } from './schemas/dailyClaimStatus.schema';
import { Test } from '@nestjs/testing';
import { DynamooseModule } from 'nestjs-dynamoose';
import { QueryStoreService } from 'query-store';
import { DailyClaimAmountsSchema } from './schemas/dailyClaimAmounts.schema';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Observable } from 'rxjs';
import MockDate from 'mockdate';

describe('DailyClaimService', () => {
  let service: DailyClaimService;

  const dailyClaimAmountsModel = dynamoose.model(
    'dailyClaimAmounts',
    DailyClaimAmountsSchema,
  );
  const dailyClaimStatusModel = dynamoose.model(
    'dailyClaimStatus',
    DailyClaimStatusSchema,
  );

  const queryStoreService = {
    updateTournament: jest.fn(),
    updateTournamentEntry: jest.fn(),
  };

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [
        DynamooseModule.forRoot({
          aws: {
            region: 'us-east-1',
          },
          local: true,
          table: {
            create: false,
          },
        }),
      ],
      providers: [
        {
          provide: 'dailyClaimAmountsModel',
          useValue: dailyClaimAmountsModel,
        },
        {
          provide: 'dailyClaimStatusModel',
          useValue: dailyClaimStatusModel,
        },
        DailyClaimService,
        {
          provide: QueryStoreService,
          useValue: queryStoreService,
        },
        {
          provide: NatsJetStreamClientProxy,
          useValue: {
            // Return a observable that returns an object with success
            send: jest.fn().mockReturnValue(
              new Observable((subscriber) => {
                subscriber.next({ success: true });
                subscriber.complete();
              }),
            ),
          },
        },
      ],
    }).compile();

    service = app.get<DailyClaimService>(DailyClaimService);

    jest.spyOn(dailyClaimAmountsModel, 'get').mockImplementation((_key) =>
      Promise.resolve({
        dailyClaimAmounts: [750, 1250, 1500, 1725, 1825, 1850],
      }),
    );
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    MockDate.reset();
  });

  describe('claim', () => {
    it('should return a valid nextClaim timestamp after first claim', async () => {
      jest
        .spyOn(dailyClaimStatusModel, 'get')
        .mockImplementation((_key) => Promise.resolve(null));

      jest
        .spyOn(dailyClaimStatusModel, 'update')
        .mockImplementation((_key, _update) => Promise.resolve(null));

      const now = new Date('2024-06-01T00:00:00Z');
      MockDate.set(now);

      const claimResult = await service.claim('user1', 750);
      if (claimResult.isErr()) {
        throw new Error(claimResult.error);
      }
      const { streak, nextClaimDate, claimExpiryDate } = claimResult.value;

      expect(streak).toBe(1);
      expect(nextClaimDate).toBe('2024-06-02T00:00:00.000Z');
      expect(claimExpiryDate).toBe('2024-06-03T00:00:00.000Z');
    });

    it('should return a valid nextClaim timestamp after second claim', async () => {
      jest.spyOn(dailyClaimStatusModel, 'get').mockImplementation((_key) =>
        Promise.resolve({
          pk: 'dailyClaimStatus',
          sk: 'user1',
          dailyClaimStreak: 1,
          nextClaimDate: '2024-06-02T00:00:00.000Z',
          claimExpiryDate: '2024-06-03T00:00:00.000Z',
        }),
      );

      jest
        .spyOn(dailyClaimStatusModel, 'update')
        .mockImplementation((_key, _update) => Promise.resolve(null));

      const now = new Date('2024-06-02T00:00:00Z');
      MockDate.set(now);

      const claimResult = await service.claim('user1', 1250);
      if (claimResult.isErr()) {
        throw new Error(claimResult.error);
      }
      const { streak, nextClaimDate, claimExpiryDate } = claimResult.value;

      expect(streak).toBe(2);
      expect(nextClaimDate).toBe('2024-06-03T00:00:00.000Z');
      expect(claimExpiryDate).toBe('2024-06-04T00:00:00.000Z');
    });

    it('should return an error if the claim amount is invalid', async () => {
      jest.spyOn(dailyClaimStatusModel, 'get').mockImplementation((_key) =>
        Promise.resolve({
          pk: 'dailyClaimStatus',
          sk: 'user1',
          dailyClaimStreak: 1,
          nextClaimDate: '2024-06-02T00:00:00.000Z',
          claimExpiryDate: '2024-06-03T00:00:00.000Z',
        }),
      );

      const now = new Date('2024-06-02T00:00:00Z');
      MockDate.set(now);

      const result = await service.claim('user1', 1500);

      expect(result._unsafeUnwrapErr()).toBe(ClaimError.InvalidClaimAmount);
    });

    it('should return an error when trying to claim too soon', async () => {
      jest.spyOn(dailyClaimStatusModel, 'get').mockImplementation((_key) =>
        Promise.resolve({
          pk: 'dailyClaimStatus',
          sk: 'user1',
          dailyClaimStreak: 1,
          nextClaimDate: '2024-06-02T00:00:00.000Z',
          claimExpiryDate: '2024-06-03T00:00:00.000Z',
        }),
      );

      const now = new Date('2024-06-01T13:00:00Z');
      MockDate.set(now);

      const result = await service.claim('user1', 1250);

      expect(result._unsafeUnwrapErr()).toBe(ClaimError.ClaimTooSoon);
    });

    it('should return an error when trying to claim after expiry', async () => {
      jest.spyOn(dailyClaimStatusModel, 'get').mockImplementation((_key) =>
        Promise.resolve({
          pk: 'dailyClaimStatus',
          sk: 'user1',
          dailyClaimStreak: 1,
          nextClaimDate: '2024-06-02T00:00:00.000Z',
          claimExpiryDate: '2024-06-03T00:00:00.000Z',
        }),
      );

      const now = new Date('2024-06-04T00:00:00Z');
      MockDate.set(now);

      const result = await service.claim('user1', 1250);

      expect(result._unsafeUnwrapErr()).toBe(ClaimError.ClaimExpired);
    });

    it('should repeat the last claim amount indefinitely', async () => {
      let item = {
        pk: 'dailyClaimStatus',
        sk: 'user1',
        dailyClaimStreak: 5,
        nextClaimDate: '2024-06-02T00:00:00.000Z',
        claimExpiryDate: '2024-06-03T00:00:00.000Z',
      };
      jest
        .spyOn(dailyClaimStatusModel, 'get')
        .mockImplementation((_key) => Promise.resolve(item));

      jest
        .spyOn(dailyClaimStatusModel, 'update')
        .mockImplementation((_key, _update) => {
          item = { ...item, ..._update };
        });

      let now = new Date('2024-06-02T13:00:00Z');
      MockDate.set(now);
      await service.claim('user1', 1850);

      now = new Date('2024-06-03T13:00:00Z');
      MockDate.set(now);
      await service.claim('user1', 1850);

      now = new Date('2024-06-04T13:00:00Z');
      MockDate.set(now);
      await service.claim('user1', 1850);

      now = new Date('2024-06-05T13:00:00Z');
      MockDate.set(now);
      let claimResult = await service.claim('user1', 1850);

      if (claimResult.isErr()) {
        throw new Error(claimResult.error);
      }
      const { streak, nextClaimDate, claimExpiryDate } = claimResult.value;

      expect(streak).toBe(9);
      expect(nextClaimDate).toBe('2024-06-06T13:00:00.000Z');
      expect(claimExpiryDate).toBe('2024-06-07T13:00:00.000Z');
    });

    it('should allow initial claim after expiry', async () => {
      jest.spyOn(dailyClaimStatusModel, 'get').mockImplementation((_key) =>
        Promise.resolve({
          pk: 'dailyClaimStatus',
          sk: 'user1',
          dailyClaimStreak: 1,
          nextClaimDate: '2024-06-02T00:00:00.000Z',
          claimExpiryDate: '2024-06-03T00:00:00.000Z',
        }),
      );

      const now = new Date('2024-06-04T13:00:00Z');
      MockDate.set(now);

      const claimResult = await service.claim('user1', 750);
      if (claimResult.isErr()) {
        throw new Error(claimResult.error);
      }
      const { streak, nextClaimDate, claimExpiryDate } = claimResult.value;

      expect(streak).toBe(1);
      expect(nextClaimDate).toBe('2024-06-05T13:00:00.000Z');
      expect(claimExpiryDate).toBe('2024-06-06T13:00:00.000Z');
    });
  });
});
