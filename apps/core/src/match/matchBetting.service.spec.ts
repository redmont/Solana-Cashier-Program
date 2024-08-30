import { Test } from '@nestjs/testing';
import { Observable } from 'rxjs';
import { MatchBettingService } from './matchBetting.service';
import { MatchPersistenceService } from './matchPersistence.service';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { ActivityStreamService } from '@/activityStream';
import { GatewayManagerService } from '@/gatewayManager/gatewayManager.service';
import { UsersService } from '@/users/users.service';
import { TournamentService } from '@/tournament/tournament.service';

describe('MatchBettingService', () => {
  let service: MatchBettingService;

  const matchPersistenceService = {
    getBets: jest.fn(),
    createUserMatchResult: jest.fn(),
    recordUserMatchHistory: jest.fn(),
    recordFightHistory: jest.fn(),
  };

  const activityStreamService = {
    track: jest.fn(),
  };

  const gatewayManagerService = {
    emitToClient: jest.fn(),
  };

  const usersService = {
    creditXp: jest.fn(),
  };

  const tournamentService = {
    trackXp: jest.fn(),
  };

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        {
          provide: MatchPersistenceService,
          useValue: matchPersistenceService,
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
        {
          provide: ActivityStreamService,
          useValue: activityStreamService,
        },
        {
          provide: GatewayManagerService,
          useValue: gatewayManagerService,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: TournamentService,
          useValue: tournamentService,
        },
        MatchBettingService,
      ],
    }).compile();

    service = app.get<MatchBettingService>(MatchBettingService);
  });

  describe('distributeWinnings', () => {
    it('should allocate xp based on net bet amount, discouriging bets on both sides', async () => {
      jest.spyOn(matchPersistenceService, 'getBets').mockResolvedValue([
        {
          userId: 'user1',
          fighter: 'fighter1',
          amount: 20_000,
        },
        {
          userId: 'user1',
          fighter: 'fighter2',
          amount: 10_000,
        },
      ]);

      const seriesConfig: any = {
        fighters: [
          {
            codeName: 'fighter1',
            ticker: 'ticker1',
          },
          {
            codeName: 'fighter2',
            ticker: 'ticker2',
          },
        ],
      };
      const winningFighter = {
        codeName: 'fighter1',
        displayName: 'Fighter 1',
      };
      await service.distributeWinnings(
        'test',
        'testmatch',
        winningFighter,
        {
          fighter1: {
            absolute: 1,
            relative: 1,
          },
        },
        seriesConfig,
        '2022-01-01T00:00:00Z',
      );

      expect(usersService.creditXp).toHaveBeenCalledTimes(1);
      expect(usersService.creditXp).toHaveBeenCalledWith('user1', 10_000);

      expect(tournamentService.trackXp).toHaveBeenCalledTimes(1);
    });

    it('should allocate xp based on net bet amount', async () => {
      jest.spyOn(matchPersistenceService, 'getBets').mockResolvedValue([
        {
          userId: 'user1',
          fighter: 'fighter1',
          amount: 20_000,
        },
        {
          userId: 'user1',
          fighter: 'fighter1',
          amount: 30_000,
        },
      ]);

      const seriesConfig: any = {
        fighters: [
          {
            codeName: 'fighter1',
            ticker: 'ticker1',
          },
          {
            codeName: 'fighter2',
            ticker: 'ticker2',
          },
        ],
      };
      const winningFighter = {
        codeName: 'fighter1',
        displayName: 'Fighter 1',
      };
      await service.distributeWinnings(
        'test',
        'testmatch',
        winningFighter,
        {
          fighter1: {
            absolute: 1,
            relative: 1,
          },
        },
        seriesConfig,
        '2022-01-01T00:00:00Z',
      );

      expect(usersService.creditXp).toHaveBeenCalledTimes(1);
      expect(usersService.creditXp).toHaveBeenCalledWith('user1', 50_000);

      expect(tournamentService.trackXp).toHaveBeenCalledTimes(1);
    });
  });
});
