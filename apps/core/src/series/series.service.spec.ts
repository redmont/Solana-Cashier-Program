import { SeriesPersistenceService } from './seriesPersistence.service';
import { SeriesService } from './series.service';

describe('SeriesService', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    //SoundPlayer.mockClear();
  });

  it('should jump-start the series if it was in a specific state', async () => {
    // Arrange
    const persistedSeries = [
      {
        sk: 'series1',
        state:
          '{"value": {"runMatch": "retryAllocation"}, "context": {"startTime":"2024-04-19T09:28:24.646Z"}}',
      },
      {
        sk: 'series2',
        state:
          '{"value": {"runMatch": {"bettingOpen": true}}, "context": {"startTime":"2024-04-19T09:28:24.646Z"}}',
      },
      {
        sk: 'series3',
        state:
          '{"value": "runMatchAfterDelay", "context": {"startTime":"2024-04-19T09:28:24.646Z"}}',
      },
      {
        sk: 'series4',
        state:
          '{"value": {"runMatch": "matchInProgress"}, "context": {"startTime":"2024-04-19T09:28:24.646Z"}}',
      },
    ];

    // mock the entire SeriesPersistenceService class, and only override the get method
    const seriesPersistenceServiceMock = jest
      .spyOn(SeriesPersistenceService.prototype, 'get')
      .mockImplementation(async () => {
        return persistedSeries as any;
      });

    const seriesPersistenceService = new SeriesPersistenceService(null, null);

    // const seriesPersistenceService = {
    //   get: jest.fn().mockResolvedValue(persistedSeries),
    // };
    const seriesService = new SeriesService(
      seriesPersistenceService,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    );
    seriesService.initSeries = jest.fn();
    seriesService.sendEvent = jest.fn();

    // Act
    await seriesService.restoreState();

    // Assert
    expect(seriesPersistenceService.get).toHaveBeenCalled();
    expect(seriesService.initSeries).toHaveBeenCalledTimes(4);
    expect(seriesService.sendEvent).toHaveBeenCalledTimes(0);
  });
});
