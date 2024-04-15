'use client';

import React from 'react';
import { EthWalletProvider } from '../web3';
import { AuthProvider } from '../AuthProvider';
import { AppStateProvider } from '../AppStateProvider';

import { EthConnectButton, EthMobileConnectButton } from '@/components/web3';
import { ChildContainerProps } from '@/types';
import { twitchChannel } from '@/config';
import { BetsPanel } from '@/components/betsPanel';
import { StreamChat } from '@/components/streamChat';
import { ActivityStream } from '@/components/activityStream';
import { TwitchChat } from 'react-twitch-embed';

export const Layout = (props: ChildContainerProps) => {
  return (
    <AppStateProvider>
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
                  <TwitchChat
                    channel={twitchChannel}
                    width="100%"
                    height="100%"
                  />
                </div>
              </div>
            </main>
          </div>
        </AuthProvider>
      </EthWalletProvider>
    </AppStateProvider>
  );
};
