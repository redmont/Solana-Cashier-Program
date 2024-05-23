'use client';

import React from 'react';

import { AppStateProvider } from './appStateProvider';
import { ChildContainerProps } from '@/types';

import { EthWalletProvider } from './EthWalletProvider';
import { SocketProvider } from './SocketProvider';
import { PostHogProvider } from './PostHogProvider';

export const AppProviders = (props: ChildContainerProps) => {
  return (
    <EthWalletProvider>
      <PostHogProvider>
        <SocketProvider>
          <AppStateProvider>{props.children}</AppStateProvider>
        </SocketProvider>
      </PostHogProvider>
    </EthWalletProvider>
  );
};
