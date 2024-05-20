'use client';

import React from 'react';
import Link from 'next/link';

import { JoinButton, MobileJoinButton } from '@/components/JoinButton';
import { ChildContainerProps } from '@/types';
import { useAppState, useEthWallet } from '@/hooks';
import { usePostHog } from '@/hooks/usePostHog';

export const Layout = (props: ChildContainerProps) => {
  usePostHog();

  const { balance } = useAppState();
  const { isReady } = useEthWallet();

  return (
    <div className="layout">
      <div className="logo-container">
        <Link href="/">
          <img className="logo-mobile" src="/logo-mobile.png" alt="Logo" />
          <img className="logo" src="/logo.png" alt="Logo" />
        </Link>
      </div>

      {isReady && (
        <div className="topbar-tools">
          <div className="topbar-balance">
            <span>Points: {Math.floor(balance)}</span>
          </div>

          <JoinButton className="p-button-secondary p-button-outlined hidden md:block" />
          <MobileJoinButton className="md:hidden" />
        </div>
      )}

      {props.children}
    </div>
  );
};
