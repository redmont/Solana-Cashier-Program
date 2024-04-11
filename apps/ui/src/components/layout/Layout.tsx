'use client';

import React, { useCallback, useEffect, useRef, useContext } from 'react';
import { classNames } from 'primereact/utils';
import { EthWalletProvider } from '../web3';
import { AuthProvider } from '../AuthProvider';
import { useAccount } from 'wagmi';

import { EthConnectButton, EthMobileConnectButton } from '@/components/web3';
import { ChildContainerProps } from '@/types';
import { BetsPanel } from '@/components/betsPanel';
import { StreamChat } from '@/components/streamChat';
import { ActivityStream } from '@/components/activityStream';

export const Layout = (props: ChildContainerProps) => {
  return (
    <EthWalletProvider>
      <AuthProvider>
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

          <main className="flex flex-grow-1">
            <div className="layout-left-sidebar">
              <BetsPanel />
            </div>

            <div className="layout-content">{props.children}</div>

            <div className="layout-right-sidebar">
              <div className="activity-stream-container">
                <ActivityStream />
              </div>

              <div className="stream-chat-container">
                <StreamChat />
              </div>
            </div>
          </main>
        </div>
      </AuthProvider>
    </EthWalletProvider>
  );
};
