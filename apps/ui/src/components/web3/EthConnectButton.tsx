'use client';

import { FC } from 'react';
import { ConnectKitButton } from 'connectkit';
import { classNames } from 'primereact/utils';

import { Button } from 'primereact/button';

export interface EthConnectButtonProps {
  className?: string;
  size?: 'small' | 'large';
}

export const EthConnectButton: FC<EthConnectButtonProps> = ({ ...props }) => (
  <ConnectKitButton.Custom>
    {({ isConnected, show, truncatedAddress }) => {
      return (
        <Button
          size={props.size}
          type="button"
          label={isConnected ? truncatedAddress : 'Connect Wallet'}
          className={classNames(props.className, 'font-normal', {
            'px-4 py-3': props.size === 'large',
            'px-4 py-2': !props.size,
          })}
          onClick={show}
        />
      );
    }}
  </ConnectKitButton.Custom>
);

export const EthMobileConnectButton: FC<EthConnectButtonProps> = (props) => (
  <ConnectKitButton.Custom>
    {({ show }) => {
      return (
        <Button
          type="button"
          icon="pi pi-wallet"
          rounded
          size="large"
          className={classNames(props.className, 'p-4')}
          onClick={show}
        />
      );
    }}
  </ConnectKitButton.Custom>
);
