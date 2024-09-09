import React, { FC } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import networks, { ChainId } from '@/config/chains';

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
  const selectedNetwork = networks.find((n) => n.id === selected);
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
