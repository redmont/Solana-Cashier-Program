'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { JoinButton, MobileJoinButton } from '@/components/JoinButton';
import { ChildContainerProps } from '@/types';
import { useAppState, useEthWallet } from '@/hooks';
import { usePostHog } from '@/hooks/usePostHog';
import {
  TutorialDialog,
  shouldShowTutorial,
} from '@/components/tutorialDialog';

export const Layout = (props: ChildContainerProps) => {
  usePostHog();

  const [isReady, setReady] = useState(false);
  const [isTutorialVisible, setTutorialVisible] = useState(false);

  const { balance, isBalanceReady } = useAppState();
  const { isConnected } = useEthWallet();

  const currentPath = usePathname();

  const isActive = (path: string) => currentPath === path;

  useEffect(() => {
    setReady(true);
    setTutorialVisible(shouldShowTutorial());
  }, []);

  const hideTutorial = useCallback(() => setTutorialVisible(false), []);

  return (
    <div className="layout">
      <div className="topbar">
        <div className="logo-container">
          <Link href="/">
            <img className="logo-mobile" src="/logo-mobile.png" alt="Logo" />
            <img className="logo" src="/logo.png" alt="Logo" />
          </Link>
        </div>

        <div className="spacer" />
        <div className="topnav">
          <Link
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            href="/"
          >
            Play
          </Link>

          <Link
            className={`nav-link ${isActive('/tournament') ? 'active' : ''}`}
            href="/tournament"
          >
            Tournament
          </Link>

          <span
            className={`nav-link ${isActive('/how-to-play') ? 'active' : ''}`}
            onClick={() => setTutorialVisible(true)}
          >
            How To Play
          </span>
        </div>

        <div className="topbar-tools">
          {isReady && isConnected && isBalanceReady && (
            <>
              <div className="balance-mobile md:hidden">
                {Math.floor(balance)} CR
              </div>

              <div className="balance-desktop md:flex">
                {/* <div className="balance-cashier-desktop">Cashier</div> */}
                <div>Credits: {Math.floor(balance)}</div>
              </div>
            </>
          )}

          <Link
            href="/tournament"
            className={`p-button-link md:hidden ${isActive('/tournament') ? 'active' : ''}`}
          >
            <i className="pi pi-trophy"></i>
          </Link>

          <span
            className={`p-button-link md:hidden ${isActive('/how-to-play') ? 'active' : ''}`}
            onClick={() => setTutorialVisible(true)}
          >
            <i className="pi pi-book"></i>
          </span>

          <JoinButton className="p-button-secondary p-button-outlined hidden md:block" />
          <MobileJoinButton className="md:hidden" />
        </div>
      </div>

      {props.children}

      <TutorialDialog visible={isTutorialVisible} onHide={hideTutorial} />
    </div>
  );
};
