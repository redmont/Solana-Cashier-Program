'use client';

import React from 'react';
import { EthWalletProvider } from '../web3';
import { AuthProvider } from '../AuthProvider';
import { AppStateProvider } from '../AppStateProvider';

import { EthConnectButton, EthMobileConnectButton } from '@/components/web3';
import { ChildContainerProps } from '@/types';

export const Layout = (props: ChildContainerProps) => {
  return (
    <EthWalletProvider>
      <AuthProvider>
        <AppStateProvider>
          <div className="layout">
            <div className="logo-container">
              <img src="/logo.svg" alt="Logo" />
            </div>

            <div className="topbar-tools">
              <EthConnectButton className="p-button-secondary p-button-outlined hidden md:block" />
              <EthMobileConnectButton className="md:hidden" />
            </div>

            {props.children}
          </div>
        </AppStateProvider>
      </AuthProvider>
    </EthWalletProvider>
  );
};
