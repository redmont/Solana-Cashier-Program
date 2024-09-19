import { FC, PropsWithChildren } from 'react';

import { useStateSubscriptions } from '../hooks/useStateSubscriptions';
import { Provider } from 'jotai';
import useReferrerParam from '@/hooks/useReferrerParam';

export const StateSubscriptionsProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  useReferrerParam();
  useStateSubscriptions();

  return children;
};

export const AppStateProvider: FC<PropsWithChildren> = ({ children }) => (
  <Provider>
    <StateSubscriptionsProvider>{children}</StateSubscriptionsProvider>
  </Provider>
);
