'use client';

import React from 'react';

import { AppStateProvider } from './appStateProvider';
import { ChildContainerProps } from '@/types';

import { EthWalletProvider } from './EthWalletProvider';
import { AuthProvider } from './AuthProvider';
import { SocketProvider } from './SocketProvider';
import { PostHogProvider } from './PostHogProvider';
import Web2AuthProvider from './Web2AuthProvider';

export const AppProviders = (props: ChildContainerProps) => {
  return (
    <EthWalletProvider>
      <Web2AuthProvider>
        <AuthProvider>
          <PostHogProvider>
            <SocketProvider>
              <AppStateProvider>{props.children}</AppStateProvider>
            </SocketProvider>
          </PostHogProvider>
        </AuthProvider>
      </Web2AuthProvider>
    </EthWalletProvider>
  );
};
