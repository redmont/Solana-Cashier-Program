'use client';

import React from 'react';
import { EthWalletProvider } from '../web3';
import { AuthProvider } from '../AuthProvider';
import { AppStateProvider, AppStateContext } from '../appStateProvider';
import { SocketProvider } from '../SocketProvider';

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
                    <img
                      className="logo-mobile"
                      src="/logo-mobile.png"
                      alt="Logo"
                    />
                    <img className="logo" src="/logo.png" alt="Logo" />
                  </div>

                  <div className="topbar-tools">
                    <div className="topbar-balance">
                      <span>Balance: {balance} points</span>
                    </div>

                    <EthConnectButton className="p-button-secondary p-button-outlined hidden md:block" />
                    <EthMobileConnectButton className="md:hidden" />
                  </div>

                  {props.children}
                </div>
              )}
            </AppStateContext.Consumer>
          </AppStateProvider>
        </SocketProvider>
      </AuthProvider>
    </EthWalletProvider>
  );
};
