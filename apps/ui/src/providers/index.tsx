'use client';

import React from 'react';

import { AppStateProvider } from './appStateProvider';
import { ChildContainerProps } from '@/types';

import { EthWalletProvider } from './EthWalletProvider';
import { AuthProvider } from './AuthProvider';
import { SocketProvider } from './SocketProvider';
import { PostHogProvider } from './PostHogProvider';

export const AppProviders = (props: ChildContainerProps) => {
  return (
    <EthWalletProvider>
      <AuthProvider>
        <PostHogProvider>
          <SocketProvider>
            <AppStateProvider>{props.children}</AppStateProvider>
          </SocketProvider>
        </PostHogProvider>
      </AuthProvider>
    </EthWalletProvider>
  );
};
