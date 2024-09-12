'use client';

import React from 'react';

import { AppStateProvider } from './AppStateProvider';
import { ChildContainerProps } from '@/types';

import { WalletProvider } from './WalletProvider';
import { SocketProvider } from './SocketProvider';
import { PostHogProvider } from './PostHogProvider';

export const AppProviders = (props: ChildContainerProps) => {
  return (
    <PostHogProvider>
      <WalletProvider>
        <SocketProvider>
          <AppStateProvider>{props.children}</AppStateProvider>
        </SocketProvider>
      </WalletProvider>
    </PostHogProvider>
  );
};
