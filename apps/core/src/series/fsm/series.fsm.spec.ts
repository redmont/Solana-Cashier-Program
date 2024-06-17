import { createActor, waitFor } from 'xstate';
import { createSeriesFSM } from './series.fsm';
import { MatchState } from './matchState';

describe('SeriesFsm', () => {
  beforeEach(() => {});

  it('should transition through to matchInProgress state', async () => {
    let snapshot;

    const onStateChange = jest.fn();

    const actor = createActor(
      createSeriesFSM('test', 'Test', {
        logger: null,
        getSeriesConfig: async () => ({
          preMatchDelay: 1,
          fighters: [],
          requiredCapabilities: {},
          betPlacementTime: 1,
          preMatchVideoPath: '',
          level: '',
          fightType: 'MMA',
        }),
        setCurrentMatchId: () => null,
        allocateServerForMatch: async () => ({
          serverId: 'serverId',
          capabilities: {
            finishingMoves: [],
            models: {
              head: [],
              torso: [],
              legs: [],
            },
            levels: [],
          },
          streamUrl: '',
        }),
        determineOutcome: async () => null,
        distributeWinnings: async () => null,
        resetBets: async () => null,
        onStateChange,
        matchCompleted: async () => null,
      }),
    );

    expect(actor).toBeDefined();

    // Start the fsm
    const service = actor.start();

    snapshot = service.getSnapshot();

    expect(snapshot.value).toBe('idle');

    service.send({ type: 'RUN' });

    await waitFor(
      service,
      (state) =>
        state.matches({
          runMatch: { bettingClosed: 'onStateChange' },
        }),
      {
        timeout: 5_000,
      },
    );

    await waitFor(
      service,
      (state) =>
        state.matches({
          runMatch: { bettingClosed: 'setMatchInProgress' },
        }),
      {
        timeout: 20_000,
      },
    );

    expect(
      onStateChange.mock.calls.map((call) => call[0] as MatchState),
    ).toEqual([
      'pendingStart',
      'bettingOpen',
      'pollingPrices',
      'matchInProgress',
    ]);
  }, 30_000);
});
