import { useCallback, useReducer, useRef } from 'react';
import dayjs, { Dayjs } from 'dayjs';

export function useDeferredState<S extends Object>(
  initialState: S,
): [
  S,
  (timestamp: string | Date, patch: Partial<S>) => void,
  (timestamp: string | Date, state: S) => void,
] {
  const patches = useRef<[Dayjs, Partial<S>][]>([]);
  const isReady = useRef<boolean>(false);

  const [state, dispatch] = useReducer(
    (state: S, patch: Partial<S>): S => ({
      ...state,
      ...patch,
    }),
    initialState,
  );

  const patchState = useCallback(
    (timestamp: string | Date | Dayjs, patch: Partial<S>) => {
      if (isReady.current) return dispatch(patch);

      patches.current.push([dayjs(timestamp), patch]);
    },
    [dispatch],
  );

  const setState = useCallback(
    (timestamp: string | Date, state: S) => {
      dispatch(
        patches.current
          .sort(([ts1], [ts2]) => ts1.diff(ts2))
          .filter(([ts]) => ts.diff(timestamp) > 0)
          .reduce((result, [_, upd]) => {
            return {
              ...result,
              ...upd,
            };
          }, state),
      );

      patches.current = [];
      isReady.current = true;
    },
    [dispatch],
  );

  return [state, patchState, setState];
}
