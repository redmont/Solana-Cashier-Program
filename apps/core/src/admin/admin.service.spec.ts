import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { AdminService } from './admin.service';
import { Test } from '@nestjs/testing';
import { Observable } from 'rxjs';
import { UsersService } from '@/users/users.service';

describe('AdminService', () => {
  let service: AdminService;

  const send = jest.fn();

  beforeAll(async () => {
    const usersService = {
      getUserIdByWalletAddress: jest.fn().mockResolvedValue('testid'),
    };

    const app = await Test.createTestingModule({
      imports: [],
      providers: [
        AdminService,
        {
          provide: NatsJetStreamClientProxy,
          useValue: {
            send,
          },
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    service = app.get<AdminService>(AdminService);
  });

  describe('processPointsBalancesUpload', () => {
    it('should process VIP credit upload', async () => {
      // One VIP deposit, one standard deposit
      const sampleCsv = `0x1234567890abcdef1234567890abcdef12345678,100,true\n0x87654321fedcba0987654321fedcba0987654321,200,false`;

      const file = {
        originalname: 'credits.csv',
        mimetype: 'text/csv',
        path: 'credits.csv',
        buffer: Buffer.from(sampleCsv),
      };

      send.mockReturnValue(
        new Observable((subscriber) => {
          subscriber.next({ success: true });
          subscriber.complete();
        }),
      );

      const { credits, debits, errors } =
        await service.processPointsBalancesUpload(file as Express.Multer.File);

      expect(credits).toEqual(2);
      expect(debits).toEqual(0);
      expect(errors).toEqual([]);

      // Get last 2 calls
      const lastCalls = send.mock.calls.slice(-2);

      expect(lastCalls[0][1]).toMatchObject({ payload: { vip: true } });
      expect(lastCalls[1][1]).toMatchObject({ payload: { vip: false } });
    });
  });
});
