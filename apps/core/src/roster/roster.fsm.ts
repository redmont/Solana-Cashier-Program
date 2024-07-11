import { setup, assign, fromPromise } from 'xstate';

export type RosterScheduleType = 'linear' | 'random';

interface SeriesFromSchedule {
  codeName: string;
  fighters: {
    codeName: string;
    displayName: string;
    imagePath: string;
  }[];
}

export function createRosterFSM({
  getSeriesFromSchedule,
  runSeries,
}: {
  getSeriesFromSchedule: () => Promise<SeriesFromSchedule | null>;
  runSeries: (series: SeriesFromSchedule) => Promise<void>;
}) {
  return setup({
    types: {
      context: {} as { nextSeries: SeriesFromSchedule },
      events: {} as
        | { type: 'run' }
        | { type: 'seriesMatchCompleted'; codeName: string },
    },
    actors: {
      getSeriesFromSchedule: fromPromise<SeriesFromSchedule | null, void>(() =>
        getSeriesFromSchedule(),
      ),
      runSeries: fromPromise<void, SeriesFromSchedule>(({ input }) =>
        runSeries(input),
      ),
    },
  }).createMachine({
    context: {
      nextSeries: null,
    },
    id: 'roster',
    initial: 'idle',
    states: {
      idle: {
        on: {
          run: {
            target: 'getNextSeriesFromSchedule',
          },
        },
      },
      getNextSeriesFromSchedule: {
        description: 'Ensure there are at least 5 series in the schedule.',
        invoke: {
          src: 'getSeriesFromSchedule',
          onDone: [
            {
              guard: ({ event }) => Boolean(event.output),
              actions: assign({
                nextSeries: ({ event }) => event.output,
              }),
              target: 'runSeries',
            },
            {
              target: 'idle',
            },
          ],
        },
      },
      runSeries: {
        description: 'Run the next series in the schedule.',
        invoke: {
          input: ({ context }) => context.nextSeries,
          src: 'runSeries',
        },
        on: {
          seriesMatchCompleted: {
            target: 'postMatchDelay',
            guard: ({ context, event }) =>
              event.codeName === context.nextSeries.codeName,
          },
        },
      },
      postMatchDelay: {
        after: {
          10_000: 'getNextSeriesFromSchedule',
        },
      },
    },
  });
}
