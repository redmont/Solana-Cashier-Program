import { setup, assign, fromPromise } from 'xstate';

export type RosterScheduleType = 'linear' | 'random';

export function createRosterFSM({
  getSeriesFromSchedule,
  runSeries,
}: {
  getSeriesFromSchedule: () => Promise<string | null>;
  runSeries: (seriesCodeName: string) => Promise<void>;
}) {
  return setup({
    types: {
      context: {} as { nextSeriesCodeName: string },
      events: {} as
        | { type: 'run' }
        | { type: 'seriesMatchCompleted'; codeName: string },
    },
    actors: {
      getSeriesFromSchedule: fromPromise<string | null, void>(() =>
        getSeriesFromSchedule(),
      ),
      runSeries: fromPromise<void, string>(({ input }) => runSeries(input)),
    },
  }).createMachine({
    context: {
      nextSeriesCodeName: null,
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
                nextSeriesCodeName: ({ event }) => event.output,
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
          input: ({ context }) => context.nextSeriesCodeName,
          src: 'runSeries',
        },
        on: {
          seriesMatchCompleted: {
            target: 'postMatchDelay',
            guard: ({ context, event }) =>
              event.codeName === context.nextSeriesCodeName,
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
