import { Test } from '@nestjs/testing';
import { MatchManagementService } from './matchManagement.service';
import { GameServerService } from '@/gameServer/gameServer.service';
import { MatchBettingService } from './matchBetting.service';
import { AbstractMatchOutcomeService } from './matchOutcome/abstractMatchOutcomeService';
import { SeriesConfig } from '@/series/seriesConfig.model';
import { errAsync, ResultAsync } from 'neverthrow';

describe('MatchManagementService', () => {
  describe('determineOutcome', () => {
    let service: MatchManagementService;

    const gameServerService = {
      setOutcome: jest.fn(),
    };

    const matchBettingService = {
      getBets: jest.fn(),
    };

    const matchOutcomeService = {
      determineOutcome: jest.fn(),
    };

    beforeAll(async () => {
      const app = await Test.createTestingModule({
        providers: [
          {
            provide: GameServerService,
            useValue: gameServerService,
          },
          {
            provide: MatchBettingService,
            useValue: matchBettingService,
          },
          {
            provide: AbstractMatchOutcomeService,
            useValue: matchOutcomeService,
          },
          MatchManagementService,
        ],
      }).compile();

      service = app.get<MatchManagementService>(MatchManagementService);
    });

    it('should handle gameServerService exceptions', async () => {
      const seriesConfig: SeriesConfig = {
        betPlacementTime: 10,
        fighters: [
          {
            ticker: 'doge',
          },
          {
            ticker: 'pepe',
          },
        ],
      } as any;
      gameServerService.setOutcome.mockImplementationOnce(
        (): ResultAsync<void, string> => {
          return errAsync('error!');
        },
      );
      matchBettingService.getBets.mockResolvedValueOnce([]);
      matchOutcomeService.determineOutcome.mockResolvedValueOnce({
        winner: 'doge',
      });
      // serverId: string,
      // finishingMoves: string[],
      // matchId: string,
      // seriesConfig: SeriesConfig,
      // samplingStartTime: string,
      const result = await service.determineOutcome(
        'mockServer',
        ['mockMove'],
        'matchId',
        seriesConfig,
        '2022-01-01T00:00:00Z',
      );
    });
  });
});
