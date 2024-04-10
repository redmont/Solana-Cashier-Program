'use client';

import React, { useContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { EthConnectButton, EthMobileConnectButton } from '@/components/web3';

const Topbar = () => {
  return (
    <div className="layout-topbar">
      <div className="topbar-start"></div>

      <div className="topbar-end">
        <ul className="topbar-menu">
          <li className="relative">
            <EthConnectButton className="hidden md:block" />
            <EthMobileConnectButton className="md:hidden" />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Topbar;

Topbar.displayName = 'Topbar';
