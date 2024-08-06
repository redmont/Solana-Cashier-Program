import { FC, PropsWithChildren } from 'react';

import { useStateSubscriptions } from '../hooks/useStateSubscriptions';
import { Provider } from 'jotai';

export const StateSubscriptionsProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  useStateSubscriptions();

  return children;
};

export const AppStateProvider: FC<PropsWithChildren> = ({ children }) => (
  <Provider>
    <StateSubscriptionsProvider>{children}</StateSubscriptionsProvider>
  </Provider>
);
