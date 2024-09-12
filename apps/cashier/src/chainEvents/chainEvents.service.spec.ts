import { Test } from '@nestjs/testing';
import { ChainEventsService } from './chainEvents.service';
import { ReadModelService } from 'cashier-read-model';
import { stringToHex } from 'viem';

describe('ChainEventsService', () => {
  let service: ChainEventsService;

  const pushEvent = jest.fn();

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        {
          provide: 'AccountsConnectedEventStore',
          useValue: {
            getAggregate: jest.fn().mockImplementation(async () => {
              return {
                aggregate: {
                  version: 1,
                },
              };
            }),
            pushEvent,
          },
        },
        {
          provide: ReadModelService,
          useValue: {},
        },
        ChainEventsService,
      ],
    }).compile();

    service = app.get<ChainEventsService>(ChainEventsService);
  });

  describe('processEvent', () => {
    it('should allocate the correct amount of credits to the user', async () => {
      const accountId = 'abcdabcdabcdabcdabcdabcdabcdabcd';
      const transactionHash =
        '0x000000000000000000000000000000000000000000000000000000000000abcd';

      // Get bytes32 representation of accountId
      const accountIdBytes32 = stringToHex(accountId, { size: 64 });

      await service.processEvent({
        transactionHash,
        topics: [
          '0xe0f1c194717590480e51c809e7cbeef1245ccfd1fe3501495bd2e715549ef2b5',
          accountIdBytes32,
          '0x00000000000000000000000094a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8',
        ],
        // $0.99 USDC
        data: '0x00000000000000000000000000000000000000000000000000000000000f1b30',
        eventName: 'DepositReceived',
      });

      expect(pushEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ACCOUNT_CREDITED',
          payload: {
            accountId,
            amount: 10_000,
            reason: 'CHAIN_DEPOSIT',
            transactionHash,
          },
        }),
        expect.anything(),
      );
    });
  });
});
