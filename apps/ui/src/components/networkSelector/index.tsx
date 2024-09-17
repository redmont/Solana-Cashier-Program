import React, { FC, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import networks, { NetworkId } from '@/config/networks';

type NetworkSelectorProps = {
  selected: NetworkId | undefined;
  onSelect: (networkId: NetworkId) => void;
  loading?: boolean;
};

export const NetworkSelector: FC<NetworkSelectorProps> = ({
  selected,
  onSelect,
  loading,
}) => {
  const selectedNetwork = useMemo(
    () => networks.find((n) => n.id === selected),
    [selected],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button loading={loading} variant="dropdown" className="w-full">
          {selectedNetwork?.name ?? 'Select Network'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {networks
          .filter((n) => n.id !== selected)
          .map((network) => (
            <DropdownMenuItem
              key={network.id}
              onClick={() => {
                onSelect(network.id);
              }}
            >
              {network.name}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
