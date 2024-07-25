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
  const seriesService = {};
  const queryStoreService = {};
  const fighterProfilesService = {};

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
});
