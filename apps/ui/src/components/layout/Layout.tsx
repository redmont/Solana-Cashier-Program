'use client';

import React from 'react';
import { EthWalletProvider } from '../web3';
import { AuthProvider } from '../AuthProvider';
import { AppStateProvider, AppStateContext } from '../appStateProvider';
import { SocketProvider } from '../SocketProvider';
import { Analytics } from '../Analytics';

import { EthConnectButton, EthMobileConnectButton } from '@/components/web3';
import { ChildContainerProps } from '@/types';

export const Layout = (props: ChildContainerProps) => {
  return (
    <EthWalletProvider>
      <AuthProvider>
        <SocketProvider>
          <AppStateProvider>
            <AppStateContext.Consumer>
              {({ balance }) => (
                <div className="layout">
                  <div className="logo-container">
                    <img src="/logo.svg" alt="Logo" />
                  </div>

                  <div className="topbar-tools">
                    <div className="topbar-balance">
                      <span>Balance: {balance} points</span>
                    </div>

                    <EthConnectButton className="p-button-secondary p-button-outlined hidden md:block" />
                    <EthMobileConnectButton className="md:hidden" />
                  </div>

                  {props.children}

                  <Analytics />
                </div>
              )}
            </AppStateContext.Consumer>
          </AppStateProvider>
        </SocketProvider>
      </AuthProvider>
    </EthWalletProvider>
  );
};
