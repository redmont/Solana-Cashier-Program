import { createActor, waitFor } from 'xstate';
import { createRosterFSM } from './roster.fsm';

describe('RosterFsm', () => {
  it('should transition to runSeries when getSeriesFromSchedule is successful', async () => {
    let snapshot;

    // Mock getSeriesFromSchedule function
    const getSeriesFromSchedule = jest.fn(() => Promise.resolve('series1'));

    // Call createRosterFSM function
    const rosterFSM = createActor(
      createRosterFSM({ getSeriesFromSchedule, runSeries: jest.fn() }),
    );

    // Assert that rosterFSM is created successfully
    expect(rosterFSM).toBeDefined();

    // Start the FSM
    const service = rosterFSM.start();

    snapshot = service.getSnapshot();

    expect(snapshot.value).toBe('idle');

    service.send({ type: 'run' });

    snapshot = service.getSnapshot();

    expect(snapshot.value).toBe('getNextSeriesFromSchedule');

    await waitFor(service, (state) => state.matches('runSeries'), {
      timeout: 1000,
    });

    snapshot = service.getSnapshot();

    expect(snapshot.value).toBe('runSeries');
    expect(snapshot.context.nextSeriesCodeName).toBe('series1');
  });

  it('should transition to idle when getSeriesFromSchedule is not successful', async () => {
    let snapshot;

    // Mock getSeriesFromSchedule function
    const getSeriesFromSchedule = jest.fn(() => Promise.resolve(null));

    // Call createRosterFSM function
    const rosterFSM = createActor(
      createRosterFSM({ getSeriesFromSchedule, runSeries: jest.fn() }),
    );

    // Assert that rosterFSM is created successfully
    expect(rosterFSM).toBeDefined();

    // Start the FSM
    const service = rosterFSM.start();

    snapshot = service.getSnapshot();

    expect(snapshot.value).toBe('idle');

    service.send({ type: 'run' });

    snapshot = service.getSnapshot();

    expect(snapshot.value).toBe('getNextSeriesFromSchedule');

    await waitFor(service, (state) => state.matches('idle'), {
      timeout: 1000,
    });

    snapshot = service.getSnapshot();

    expect(snapshot.value).toBe('idle');
    expect(snapshot.context.nextSeriesCodeName).toBe(null);
  });

  it('should transition to getNextSeriesFromSchedule when match is completed', async () => {
    let snapshot;

    // Mock getSeriesFromSchedule function
    const getSeriesFromSchedule = jest.fn(() => Promise.resolve('series1'));

    // Mock runSeries function
    const runSeries = jest.fn();

    // Call createRosterFSM function
    const rosterFSM = createActor(
      createRosterFSM({ getSeriesFromSchedule, runSeries }),
    );

    // Assert that rosterFSM is created successfully
    expect(rosterFSM).toBeDefined();

    // Start the FSM
    const service = rosterFSM.start();

    snapshot = service.getSnapshot();

    expect(snapshot.value).toBe('idle');

    service.send({ type: 'run' });

    snapshot = service.getSnapshot();

    expect(snapshot.value).toBe('getNextSeriesFromSchedule');

    await waitFor(service, (state) => state.matches('runSeries'), {
      timeout: 1000,
    });

    snapshot = service.getSnapshot();

    service.send({ type: 'seriesMatchCompleted', codeName: 'series1' });

    snapshot = service.getSnapshot();

    expect(snapshot.value).toBe('postMatchDelay');

    await waitFor(service, (state) => state.value === 'getNextSeriesFromSchedule', {
      timeout: 15_000,
    });
  }, 30_000);

  it('should not transition when match is completed with an unknown series', async () => {
    let snapshot;

    // Mock getSeriesFromSchedule function
    const getSeriesFromSchedule = jest.fn(() => Promise.resolve('series1'));

    // Mock runSeries function
    const runSeries = jest.fn();

    // Call createRosterFSM function
    const rosterFSM = createActor(
      createRosterFSM({ getSeriesFromSchedule, runSeries }),
    );

    // Assert that rosterFSM is created successfully
    expect(rosterFSM).toBeDefined();

    // Start the FSM
    const service = rosterFSM.start();

    snapshot = service.getSnapshot();

    expect(snapshot.value).toBe('idle');

    service.send({ type: 'run' });

    snapshot = service.getSnapshot();

    expect(snapshot.value).toBe('getNextSeriesFromSchedule');

    await waitFor(service, (state) => state.matches('runSeries'), {
      timeout: 1000,
    });

    snapshot = service.getSnapshot();

    service.send({ type: 'seriesMatchCompleted', codeName: 'unknown' });

    await waitFor(service, (state) => state.value === 'runSeries', {
      timeout: 1000,
    });

    snapshot = service.getSnapshot();

    expect(snapshot.value).toBe('runSeries');
  });
});
