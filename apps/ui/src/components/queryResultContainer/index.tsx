import {
  UseQueryResult,
  QueryObserverSuccessResult,
} from '@tanstack/react-query';
import { ReactNode } from 'react';
import B3Spinner from '../B3Spinner/B3Spinner';
import SomethingWentWrong from '../somethingWentWrong';

type Props<T, E> = {
  query: UseQueryResult<T, E>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode | ((props: { result: T }) => ReactNode);
};

const isSuccess = <T, E>(
  query: UseQueryResult<T, E>,
): query is QueryObserverSuccessResult<T, E> => query.isSuccess;

const WidgetQueryResult = <T, E>(props: Props<T, E>) => {
  const { query, children, size = 'md' } = props;

  return (
    <>
      {isSuccess(props.query) ? (
        typeof children === 'function' ? (
          children({ result: props.query.data })
        ) : (
          children
        )
      ) : (
        <div className="absolute left-0 top-0 flex size-full flex-col items-center justify-center gap-3 px-3 py-5">
          {query.isLoading && <B3Spinner withDots size={size} />}
          {query.isError && <SomethingWentWrong size={size} />}
        </div>
      )}
    </>
  );
};

export default WidgetQueryResult;
