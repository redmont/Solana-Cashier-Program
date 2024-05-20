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
    expect(seriesService.sendEvent).toHaveBeenCalledTimes(4);
    expect(seriesService.sendEvent).toHaveBeenCalledWith(
      'series1',
      'RETRY_ALLOCATION',
    );
    expect(seriesService.sendEvent).toHaveBeenCalledWith(
      'series2',
      'REOPEN_BETTING',
    );
    expect(seriesService.sendEvent).toHaveBeenCalledWith('series3', 'RUN');
    expect(seriesService.sendEvent).toHaveBeenCalledWith(
      'series4',
      'RUN_MATCH.FINISH_MATCH',
    );
  });

  it('should jump-start the series if in bettingOpen.done state', async () => {
    // Arrange
    const persistedSeries = [
      {
        sk: 'series1',
        state:
          '{"status":"active","value":{"runMatch":{"bettingOpen":"done"}},"historyValue":{},"context":{"codeName":"frogs-vs-dogs-1","config":{"requiredCapabilities":{},"betPlacementTime":20,"fighters":[{"displayName":"Doge","codeName":"doge","model":{"head":"H_DogeA","torso":"T_DogeA","legs":"L_DogeA"}},{"displayName":"Pepe","codeName":"pepe","model":{"head":"H_PepeA","torso":"T_PepeA","legs":"L_PepeA"}}]},"matchId":"bde81657-b080-4af1-b3f9-b1009b768df7","serverId":"mock001","startTime":"2024-04-19T09:28:24.646Z","capabilities":{"finishingMoves":["TDA_Uppercut","TDA_Suplex","TDA_RoundKick","TDA_MultiSmash","TDA_Legsweep","TDA_FlyingScissor","TDA_FlyingElbow","TDA_Facepunch","TDA_Dropkick","TDA_Discombobulate","KDA_Punches","KDA_JumpKick","KDA_Headbutts"],"models":{"head":["H_PepeA","H_BrawlerA","H_BrawlerB","H_BrawlerC","H_DogeA"],"torso":["T_PepeA","T_BrawlerA","T_BrawlerB","T_BrawlerC","T_DogeA"],"legs":["L_PepeA","L_BrawlerA","L_BrawlerB","L_BrawlerC","L_DogeA"]}},"winningFighter":"pepe"},"children":{}}',
      },
    ];

    // mock the entire SeriesPersistenceService class, and only override the get method
    const seriesPersistenceServiceMock = jest
      .spyOn(SeriesPersistenceService.prototype, 'get')
      .mockImplementation(async () => {
        return persistedSeries as any;
      });

    const seriesPersistenceService = new SeriesPersistenceService(null, null);

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
    expect(seriesService.initSeries).toHaveBeenCalledTimes(1);
    expect(seriesService.sendEvent).toHaveBeenCalledTimes(1);
    expect(seriesService.sendEvent).toHaveBeenCalledWith(
      'series1',
      'REOPEN_BETTING',
    );
  });
});
