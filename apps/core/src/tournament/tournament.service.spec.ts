import { Test } from '@nestjs/testing';
import MockDate from 'mockdate';
import * as dynamoose from 'dynamoose';
import { TournamentSchema } from './schemas/tournament.schema';
import { TournamentService } from './tournament.service';
import { TournamentEntrySchema } from './schemas/tournamentEntry.schema';
import { QueryStoreService } from 'query-store';
import { DynamooseModule } from 'nestjs-dynamoose';
import { TournamentWinningsSchema } from './schemas/tournamentWinnings.schema';
import { TournamentEntry } from './interfaces/tournamentEntry.interface';
import { TournamentWinnings } from './interfaces/tournamentWinnings.interface';

describe('TournamentService', () => {
  let service: TournamentService;

  const tournamentModel = dynamoose.model('tournament', TournamentSchema);
  const tournamentEntryModel = dynamoose.model(
    'tournamentEntry',
    TournamentEntrySchema,
  );
  const tournamentWinningsModel = dynamoose.model(
    'tournamentWinnings',
    TournamentWinningsSchema,
  );
  const now = new Date();

  const queryStoreService = {
    updateTournament: jest.fn(),
    updateTournamentEntry: jest.fn(),
  };

  beforeAll(async () => {
    jest.useFakeTimers({ now });

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
          provide: 'tournamentModel',
          useValue: tournamentModel,
        },
        {
          provide: 'tournamentEntryModel',
          useValue: tournamentEntryModel,
        },
        {
          provide: 'tournamentWinningsModel',
          useValue: tournamentWinningsModel,
        },
        TournamentService,
        {
          provide: QueryStoreService,
          useValue: queryStoreService,
        },
      ],
    }).compile();

    service = app.get<TournamentService>(TournamentService);
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    MockDate.reset();
  });

  it('should not switch to next tournament round if too early', async () => {
    const startDate = '2024-06-25T01:32:33Z';
    // A few hours later, less than 24h
    const now = '2024-06-25T11:32:33Z';
    MockDate.set(now);

    let tournament = {
      pk: 'tournament',
      sk: 'tournament1',
      startDate: startDate,
      currentRound: 1,
      rounds: 30,
    };

    jest
      .spyOn(tournamentModel, 'get')
      .mockImplementation((key) => Promise.resolve(tournament));
    jest.spyOn(tournamentModel, 'query').mockImplementation(
      jest.fn().mockReturnValue({
        using: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        ge: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([tournament]),
      }),
    );

    const currentTournamentCodeName = await service.getTournamentCodeName(now);
    const currentTournament = await service.getTournament(
      currentTournamentCodeName,
    );

    expect(currentTournament.startDate).toBe(startDate);
    expect(currentTournament.currentRound).toBe(1);

    await service.processRoundChange();

    const updatedTournament = await service.getTournament(
      currentTournamentCodeName,
    );

    expect(updatedTournament.currentRound).toBe(1);
  });

  it('should switch to next tournament round if the time is right', async () => {
    const startDate = '2024-06-25T01:32:33Z';
    // A little bit after the next day
    const now = '2024-06-26T02:01:02Z';
    MockDate.set(now);

    let tournament = {
      pk: 'tournament',
      sk: 'tournament1',
      startDate: startDate,
      currentRound: 1,
      rounds: 30,
    };

    let tournamentWinnings: TournamentWinnings[] = [
      {
        pk: 'tournamentWinnings#tournament1',
        sk: 'user1234#2024-06-25T01:32:33Z',
        tournament: 'tournament1',
        userId: 'user1234',
        primaryWalletAddress: '0x1234',
        winAmount: 100,
        createdAt: '2024-06-25T01:32:33Z',
      },
    ];

    let tournamentEntries: TournamentEntry[] = [
      {
        pk: 'tournamentEntry#tournament1',
        sk: 'user1234',
        tournament: 'tournament1',
        userId: 'user1234',
        primaryWalletAddress: '0x1234',
        winAmount: 0,
        entryBetAmount: 0,
        entryBetAmountCreditedXp: 0,
        balance: '100',
        xp: 1,
        updatedAt: now,
      },
    ];

    jest
      .spyOn(tournamentModel, 'get')
      .mockImplementation((_key) => Promise.resolve(tournament));
    jest.spyOn(tournamentModel, 'query').mockImplementation(
      jest.fn().mockReturnValue({
        using: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        ge: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([tournament]),
      }),
    );
    jest.spyOn(tournamentModel, 'update').mockImplementation((_key, obj) => {
      tournament = { ...tournament, ...obj };
      return Promise.resolve(tournament);
    });

    let updateTournament = jest
      .spyOn(tournamentModel, 'update')
      .mockImplementation((key, obj) => {
        tournament = { ...tournament, ...obj };
        return Promise.resolve(tournament);
      });

    const queryTournamentWinnings = jest
      .spyOn(tournamentWinningsModel, 'query')
      .mockImplementation(
        jest.fn().mockReturnValue({
          using: jest.fn().mockReturnThis(),
          all: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(tournamentWinnings),
        }),
      );

    let updateTournamentEntry = jest
      .spyOn(tournamentEntryModel, 'update')
      .mockImplementation((key, obj) => {
        //tournament = { ...tournament, ...obj };
        return Promise.resolve({});
      });

    const currentTournamentCodeName = await service.getTournamentCodeName(now);
    const currentTournament = await service.getTournament(
      currentTournamentCodeName,
    );

    expect(currentTournament.startDate).toBe(startDate);
    expect(currentTournament.currentRound).toBe(1);

    // Should switch the round,
    // reset win amounts,
    // allocate XP
    await service.processRoundChange();

    // The correct dates should be queried
    expect(queryTournamentWinnings.mock.lastCall[0]).toEqual({
      pk: 'tournamentWinnings#tournament1',
      createdAt: {
        between: ['2024-06-25T01:32:33.000Z', '2024-06-26T01:32:33.000Z'],
      },
    });

    const updatedTournament = await service.getTournament(
      currentTournamentCodeName,
    );

    expect(updatedTournament.currentRound).toBe(2);
    expect(updateTournamentEntry.mock.lastCall?.[1]).toEqual({
      $ADD: {
        winAmount: -100,
        xp: 150,
      },
    });
    expect(queryStoreService.updateTournament).toHaveBeenCalledTimes(1);
  });
});
