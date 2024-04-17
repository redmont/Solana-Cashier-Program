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
            <div className="layout-topbar">
              <div className="topbar-start">
                <img src="/logo.svg" alt="Logo" />
              </div>

              <div className="topbar-middle">
                <ul className="topbar-menu">
                  <li className="topbar-menu-item">
                    <a className="topbar-menu-link active" href="#">
                      Gameplay
                    </a>
                  </li>
                  <li className="topbar-menu-item">
                    <a className="topbar-menu-link" href="#">
                      Dashboard
                    </a>
                  </li>
                </ul>
              </div>

              <div className="topbar-end">
                <EthConnectButton className="p-button-secondary p-button-outlined hidden md:block" />
                <EthMobileConnectButton className="md:hidden" />
              </div>
            </div>
          </div>
        </AppStateProvider>
      </AuthProvider>
    </EthWalletProvider>
  );
};
