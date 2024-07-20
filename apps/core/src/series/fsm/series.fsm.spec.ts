import { createActor, waitFor } from 'xstate';
import { createSeriesFSM } from './series.fsm';
import { MatchState } from './matchState';
import { FightType } from '../seriesConfig.model';

describe('SeriesFsm', () => {
  beforeEach(() => {});

  const onStateChange = jest.fn();
  const fsmParams = {
    logger: null,
    getSeriesConfig: async () => ({
      preMatchDelay: 1,
      fighters: [],
      requiredCapabilities: {},
      betPlacementTime: 1,
      preMatchVideoPath: '',
      level: '',
      fightType: 'MMA' as FightType,
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
      streamId: '',
    }),
    determineOutcome: async () => ({
      displayName: 'test fighter',
      codeName: 'test-fighter',
      priceDelta: {
        'test-fighter': {
          absolute: 1,
          relative: 1,
        },
      },
    }),
    distributeWinnings: async () => null,
    resetBets: async () => null,
    onStateChange,
    matchCompleted: async () => null,
  };

  it('should transition through to matchInProgress state', async () => {
    let snapshot;

    const actor = createActor(createSeriesFSM('test', 'Test', fsmParams));

    expect(actor).toBeDefined();

    // Start the fsm
    const service = actor.start();

    snapshot = service.getSnapshot();

    expect(snapshot.value).toBe('idle');

    service.send({ type: 'RUN', fighterCodeNames: ['fighter-a', 'fighter-b'] });

    await waitFor(
      service,
      (state: any) =>
        state.matches({
          runMatch: { bettingClosed: 'onStateChange' },
        }),
      {
        timeout: 5_000,
      },
    );

    await waitFor(
      service,
      (state: any) =>
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

  it('should set a pool open start time', async () => {
    let snapshot;

    const actor = createActor(createSeriesFSM('test', 'Test', fsmParams));

    expect(actor).toBeDefined();

    // Start the fsm
    const service = actor.start();

    snapshot = service.getSnapshot();

    expect(snapshot.value).toBe('idle');

    service.send({ type: 'RUN', fighterCodeNames: ['fighter-a', 'fighter-b'] });

    await waitFor(
      service,
      (state: any) =>
        state.matches({
          runMatch: 'bettingOpen',
        }),
      {
        timeout: 5_000,
      },
    );

    snapshot = service.getSnapshot();

    expect(snapshot.context.startTime).toBeDefined();
    expect(snapshot.context.poolOpenStartTime).toBeDefined();
  });
});
