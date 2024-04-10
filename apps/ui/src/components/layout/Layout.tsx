'use client';

import React, { useCallback, useEffect, useRef, useContext } from 'react';
import { classNames } from 'primereact/utils';
import { EthWalletProvider } from '../web3';
import { AuthProvider } from '../AuthProvider';

import Topbar from './Topbar';
import { ChildContainerProps } from '@/types';

export const Layout = (props: ChildContainerProps) => {
  return (
    <EthWalletProvider>
      <AuthProvider>
        <div className={classNames('layout-container')}>
          <div className="layout-content-wrapper">
            <Topbar />

            <div className="layout-content">{props.children}</div>
            <div className="layout-mask"></div>
          </div>
        </div>
      </AuthProvider>
    </EthWalletProvider>
  );
};
