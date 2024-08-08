'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { JoinButton, MobileJoinButton } from '@/components/JoinButton';
import { ChildContainerProps } from '@/types';
import { useEthWallet } from '@/hooks';
import { usePostHog } from '@/hooks/usePostHog';
import {
  TutorialDialog,
  shouldShowTutorial,
} from '@/components/tutorialDialog';
import { useAtomValue } from 'jotai';
import { balanceAtom } from '@/store/account';

export const Layout = (props: ChildContainerProps) => {
  const balance = useAtomValue(balanceAtom);
  usePostHog();

  const [isOpen, setOpen] = useState(false);
  const [isReady, setReady] = useState(false);
  const [isTutorialVisible, setTutorialVisible] = useState(false);

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
      <div className="topbar-layout">
        <div className="topbar">
          <div className="logo-container">
            <Link href="/">
              <img className="logo-mobile" src="/logo-mobile.png" alt="Logo" />
              <img className="logo" src="/logo.png" alt="Logo" />
            </Link>
          </div>

          <div className="spacer" />
          <div className="topnav">
            <div className="left-side">
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
              <Link
                className={`nav-link`}
                href="https://forms.gle/5uQjMrR419w4cT5w9"
                target="blank"
              >
                Add Your Character
              </Link>
            </div>

            <div className="right-side">
              <span
                className={`nav-link ${isActive('/how-to-play') ? 'active' : ''}`}
                onClick={() => setTutorialVisible(true)}
              >
                <img src="/tutorial.svg" alt="tutorial" />
                How To Play
              </span>
              {isReady && isConnected && balance !== undefined && (
                <div className="balance-desktop md:flex">
                  <div className="text">Credits: {Math.floor(balance)}</div>
                </div>
              )}
              <JoinButton className="username" />
            </div>
          </div>

          <div className="credits-panel"></div>

          <div className="small-mobile">
            {isReady && isConnected && balance !== undefined && (
              <div className="mobile-credit-panel-small">
                <div className="text">{Math.floor(balance)}</div>
              </div>
            )}
          </div>
          <div className="topbar-tools">
            {!isConnected && (
              <MobileJoinButton className="mobile-wallet md:hidden" />
            )}
            {isReady && isConnected && balance !== undefined && (
              <>
                <div className="balance-desktop md:flex">
                  <div className="text">Credits: {Math.floor(balance)}</div>
                </div>
                <div className="mobile-credit-panel">
                  <div className="text">{Math.floor(balance)}</div>
                </div>
              </>
            )}
            <JoinButton className="username md:flex" />
            <div
              className="hamburger-icon"
              id="icon"
              onClick={() => setOpen(!isOpen)}
            >
              <div className={`icon-1 ${isOpen ? 'a' : ''}`} id="a"></div>
              <div className={`icon-2 ${isOpen ? 'c' : ''}`} id="b"></div>
              <div className={`icon-3 ${isOpen ? 'b' : ''}`} id="c"></div>
            </div>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="mask-parent">
          <div className="navbar-mask">
            <div className="mask">
              <div className="mask-nav">
                <div className="upper">
                  <JoinButton className="username" />

                  <div className="top-side">
                    <Link
                      className={`nav-link ${isActive('/') ? 'active' : ''}`}
                      href="/"
                      onClick={() => setOpen(!isOpen)}
                    >
                      Play
                    </Link>
                    <Link
                      className={`nav-link ${isActive('/tournament') ? 'active' : ''}`}
                      href="/tournament"
                      onClick={() => setOpen(!isOpen)}
                    >
                      Tournament
                    </Link>
                    <Link
                      className={`nav-link`}
                      href="https://forms.gle/5uQjMrR419w4cT5w9"
                      target="blank"
                    >
                      Add Your Character
                    </Link>
                  </div>
                </div>

                <span
                  className={`nav-link ${isActive('/how-to-play') ? 'active' : ''}`}
                  onClick={() => setTutorialVisible(true)}
                >
                  <img src="/tutorial.svg" alt="tutorial" />
                  How To Play
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {props.children}

      <TutorialDialog visible={isTutorialVisible} onHide={hideTutorial} />
    </div>
  );
};
