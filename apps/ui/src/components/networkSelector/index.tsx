import React, { FC, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import networks, { ChainId, ChainProtocols } from '@/config/chains';

type NetworkSelectorProps = {
  selected: ChainId | undefined;
  onSelect: (networkId: ChainId) => void;
  loading?: boolean;
};

export const NetworkSelector: FC<NetworkSelectorProps> = ({
  selected,
  onSelect,
  loading,
}) => {
  const { primaryWallet } = useDynamicContext();

  const currentNetworks = useMemo(() => {
    return [
      ...networks[ChainProtocols.eip155],
      ...networks[ChainProtocols.solana],
    ];
  }, [primaryWallet?.chain]);

  const selectedNetwork = currentNetworks.find((n) => n.id === selected);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button loading={loading} variant="dropdown" className="w-full">
          {selectedNetwork?.name ?? 'Select Network'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {currentNetworks
          .filter((n) => n.id !== selected)
          .map((network) => (
            <DropdownMenuItem
              key={network.id}
              onClick={() => {
                onSelect(network.id as ChainId);
              }}
            >
              {network.name}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
