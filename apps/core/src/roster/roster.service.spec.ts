import { Test } from '@nestjs/testing';
import { RosterService } from './roster.service';
import dynamoose from 'dynamoose';
import { RosterSchema } from './roster.schema';
import { DynamooseModule } from 'nestjs-dynamoose';
import { QueryStoreService } from 'query-store';
import { FighterProfilesService } from '@/fighterProfiles/fighterProfiles.service';
import { SeriesService } from '@/series/series.service';

describe('RosterService', () => {
  let service: RosterService;

  const rosterModel = dynamoose.model('roster', RosterSchema);
  const seriesService = {
    getSeries: jest.fn(),
  };
  const queryStoreService = {};
  const fighterProfilesService = {
    list: jest.fn(),
  };

  beforeEach(async () => {
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
          provide: 'rosterModel',
          useValue: rosterModel,
        },
        {
          provide: SeriesService,
          useValue: seriesService,
        },
        {
          provide: QueryStoreService,
          useValue: queryStoreService,
        },
        {
          provide: FighterProfilesService,
          useValue: fighterProfilesService,
        },
        RosterService,
      ],
    }).compile();

    service = app.get<RosterService>(RosterService);
    service.fsm = {
      send: jest.fn(),
    } as any;
  });

  describe('updateRoster', () => {
    it('should update the schedule type', async () => {
      let updateRoster = jest
        .spyOn(rosterModel, 'update')
        .mockImplementation(() => Promise.resolve({}));

      await service.updateRoster('random');

      expect(updateRoster).toHaveBeenCalledWith(
        { pk: 'roster', sk: 'roster' },
        {
          scheduleType: 'random',
        },
      );
    });

    it('should update the schedule', async () => {
      let updateRoster = jest
        .spyOn(rosterModel, 'update')
        .mockImplementation(() => Promise.resolve({}));

      await service.updateRoster(undefined, ['series123']);

      expect(updateRoster).toHaveBeenCalledWith(
        { pk: 'roster', sk: 'roster' },
        {
          schedule: [{ codeName: 'series123' }],
        },
      );
    });
  });

  describe('getSeriesFromSchedule', () => {
    it('should return null and create an empty roster if there is no roster', async () => {
      jest
        .spyOn(rosterModel, 'get')
        .mockImplementation(() => Promise.resolve(null));

      const create = jest
        .spyOn(rosterModel, 'create')
        .mockImplementation(() => Promise.resolve({}));

      const series = await service.getSeriesFromSchedule();

      expect(series).toBeNull();
      expect(create).toHaveBeenCalledWith({
        pk: 'roster',
        sk: 'roster',
        scheduleType: 'linear',
        series: [],
        schedule: [],
        timedSeries: [],
      });
    });

    it('should return null if there are no series in the roster', async () => {
      jest.spyOn(rosterModel, 'get').mockImplementation(() =>
        Promise.resolve({
          series: [],
        }),
      );

      const series = await service.getSeriesFromSchedule();

      expect(series).toBeNull();
    });
  });

  describe('getSeriesWithFighters', () => {
    it('should return the series with the fighters', async () => {
      jest.spyOn(seriesService, 'getSeries').mockImplementationOnce(() => {
        return {
          codeName: 'series123',
          fighterProfiles: ['fighter1', 'fighter2'],
        };
      });
      jest.spyOn(fighterProfilesService, 'list').mockImplementationOnce(() => {
        return [
          {
            codeName: 'fighter1',
            ticker: 'ABC',
            displayName: 'Fighter 1',
            imagePath: '/fighter1.jpg',
            enabled: true,
          },
          {
            codeName: 'fighter2',
            ticker: 'DEF',
            displayName: 'Fighter 2',
            imagePath: '/fighter2.jpg',
            enabled: true,
          },
        ];
      });

      const series = await service.getSeriesWithFighters('series123');

      expect(series.codeName).toEqual('series123');
      expect(series.fighters).toEqual([
        {
          codeName: 'fighter1',
          displayName: 'Fighter 1',
          imagePath: '/fighter1.jpg',
        },
        {
          codeName: 'fighter2',
          displayName: 'Fighter 2',
          imagePath: '/fighter2.jpg',
        },
      ]);
    });

    it('should not use the same fighters in a random vs random series', async () => {
      jest.spyOn(seriesService, 'getSeries').mockImplementationOnce(() => {
        return {
          codeName: 'randomVsRandom',
          fighterProfiles: ['#RANDOM#', '#RANDOM#'],
        };
      });
      jest.spyOn(fighterProfilesService, 'list').mockImplementationOnce(() => {
        return [
          { codeName: 'fighter1', ticker: 'ABC', enabled: true },
          { codeName: 'fighter1', ticker: 'DEF', enabled: true },
        ];
      });

      const series = await service.getSeriesWithFighters('randomVsRandom');

      // The infinite loop prevention should kick in and only one fighter should be added
      expect(series.fighters.length).toEqual(1);
    });

    it('should not use the same ticker in a random vs random series', async () => {
      jest.spyOn(seriesService, 'getSeries').mockImplementationOnce(() => {
        return {
          codeName: 'randomVsRandom',
          fighterProfiles: ['#RANDOM#', '#RANDOM#'],
        };
      });
      jest.spyOn(fighterProfilesService, 'list').mockImplementationOnce(() => {
        return [
          { codeName: 'fighter1', ticker: 'ABC', enabled: true },
          { codeName: 'fighter2', ticker: 'ABC', enabled: true },
        ];
      });

      const series = await service.getSeriesWithFighters('randomVsRandom');

      // The infinite loop prevention should kick in and only one fighter should be added
      expect(series.fighters.length).toEqual(1);
    });

    it('should not use the same fighters in a fighter vs random series', async () => {
      jest.spyOn(seriesService, 'getSeries').mockImplementationOnce(() => {
        return {
          codeName: 'randomVsRandom',
          fighterProfiles: ['fighter1', '#RANDOM#'],
        };
      });
      jest.spyOn(fighterProfilesService, 'list').mockImplementationOnce(() => {
        return [
          { codeName: 'fighter1', ticker: 'ABC', enabled: true },
          { codeName: 'fighter1', ticker: 'DEF', enabled: true },
        ];
      });

      const series = await service.getSeriesWithFighters('randomVsRandom');

      // The infinite loop prevention should kick in and only one fighter should be added
      expect(series.fighters.length).toEqual(1);
    });

    it('should not use the same ticker in a fighter vs random series', async () => {
      jest.spyOn(seriesService, 'getSeries').mockImplementationOnce(() => {
        return {
          codeName: 'randomVsRandom',
          fighterProfiles: ['fighter1', '#RANDOM#'],
        };
      });
      jest.spyOn(fighterProfilesService, 'list').mockImplementationOnce(() => {
        return [
          { codeName: 'fighter1', ticker: 'ABC', enabled: true },
          { codeName: 'fighter2', ticker: 'ABC', enabled: true },
        ];
      });

      const series = await service.getSeriesWithFighters('randomVsRandom');

      // The infinite loop prevention should kick in and only one fighter should be added
      expect(series.fighters.length).toEqual(1);
    });
  });
});
