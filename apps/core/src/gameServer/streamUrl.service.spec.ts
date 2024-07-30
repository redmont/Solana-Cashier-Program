import { Test } from '@nestjs/testing';
import { StreamUrlService } from './streamUrl.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { from, of } from 'rxjs';

describe('StreamUrlService', () => {
  let service: StreamUrlService;

  let configService = {
    get: jest.fn().mockReturnValue(''),
  };

  let httpService = {
    get: jest.fn().mockImplementation(() => {
      return of({});
    }),
  };

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: HttpService,
          useValue: httpService,
        },
        StreamUrlService,
      ],
    }).compile();

    service = app.get<StreamUrlService>(StreamUrlService);
  });

  describe('getStreamUrl', () => {
    it('should strip the numeric suffix from the stream ID', async () => {
      const streamId = 'my_stream_1';
      const expectedStrippedStreamId = 'my_stream';

      await service.getStreamUrl(streamId);

      expect(httpService.get.mock.lastCall[0]).toContain(
        expectedStrippedStreamId,
      );
      expect(httpService.get.mock.lastCall[0]).not.toContain(streamId);
    });

    it('should return an RTMP URL that contains the stream ID', async () => {
      const streamId = 'my_stream_1';
      const response = {
        status: 200,
        data: {
          name: 'my_stream',
          scope: 'scope',
          serverAddress: 'serverAddress',
        },
      };

      httpService.get.mockReturnValueOnce(of(response));

      const result = await service.getStreamUrl(streamId);

      expect(result).toContain(streamId);
    });
  });
});
