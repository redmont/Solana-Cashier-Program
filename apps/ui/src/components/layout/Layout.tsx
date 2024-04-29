'use client';

import React from 'react';
import { Analytics } from '../Analytics';

import { EthConnectButton, EthMobileConnectButton } from '../EthConnectButton';
import { ChildContainerProps } from '@/types';
import { useAppState } from '@/hooks';

export const Layout = (props: ChildContainerProps) => {
  const { balance } = useAppState();

  return (
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
    </div>
  );
};
