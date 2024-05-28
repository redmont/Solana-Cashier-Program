'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import { JoinButton, MobileJoinButton } from '@/components/JoinButton';
import { ChildContainerProps } from '@/types';
import { useAppState, useEthWallet } from '@/hooks';
import { usePostHog } from '@/hooks/usePostHog';

export const Layout = (props: ChildContainerProps) => {
  usePostHog();

  const [isReady, setReady] = useState(false);

  const { balance } = useAppState();
  const { isConnected } = useEthWallet();

  useEffect(() => setReady(true), []);

  return (
    <div className="layout">
      <div className="logo-container">
        <Link href="/">
          <img className="logo-mobile" src="/logo-mobile.png" alt="Logo" />
          <img className="logo" src="/logo.png" alt="Logo" />
        </Link>
      </div>

      <div className="topbar-tools">
        {isReady && isConnected && (
          <div className="topbar-balance">
            <span>Credits: {Math.floor(balance)}</span>
          </div>
        )}

        <JoinButton className="p-button-secondary p-button-outlined hidden md:block" />
        <MobileJoinButton className="md:hidden" />
      </div>

      {props.children}
    </div>
  );
};
