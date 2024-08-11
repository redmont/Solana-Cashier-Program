'use client';

import React from 'react';

import { AppStateProvider } from './AppStateProvider';
import { ChildContainerProps } from '@/types';

import { EthWalletProvider } from './EthWalletProvider';
import { SocketProvider } from './SocketProvider';
import { PostHogProvider } from './PostHogProvider';

export const AppProviders = (props: ChildContainerProps) => {
  return (
    <PostHogProvider>
      <EthWalletProvider>
        <SocketProvider>
          <AppStateProvider>{props.children}</AppStateProvider>
        </SocketProvider>
      </EthWalletProvider>
    </PostHogProvider>
  );
};
