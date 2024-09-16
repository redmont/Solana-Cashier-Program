import { getNetworkType, isEvm, NetworkId } from '@/config/networks';
import { useWallet } from '@/hooks';
import evmContracts from '@bltzr-gg/brawlers-evm-contracts/exports';
import solanaContracts from '@bltzr-gg/solana-anchor-contracts/exports';
import { merge } from 'lodash';
import { useMemo } from 'react';

const contracts = merge(evmContracts, solanaContracts);

type SuccessUseContract =
  | {
      type: 'eip155';
      networkId: keyof typeof evmContracts.CashierDeposit;
      isSuccess: true;
      isLoading: false;
      depositor: (typeof evmContracts.CashierDeposit)[keyof typeof evmContracts.CashierDeposit];
      withdrawer: (typeof evmContracts.CashierWithdraw)[keyof typeof evmContracts.CashierWithdraw];
    }
  | {
      type: 'solana';
      networkId: keyof typeof solanaContracts.CashierDeposit;
      isSuccess: true;
      isLoading: false;
      depositor: (typeof solanaContracts.CashierDeposit)[keyof typeof solanaContracts.CashierDeposit];
    };

type UseContracts =
  | SuccessUseContract
  | {
      isSuccess: false;
      isLoading: true;
      depositor: undefined;
    }
  | {
      isSuccess: false;
      isLoading: true;
      depositor: undefined;
    };

export const isSuccessful = (
  contracts: UseContracts,
): contracts is SuccessUseContract => contracts.isSuccess;

export const useContracts = (): UseContracts => {
  const { networkId } = useWallet();

  const networkKey = networkId?.data as NetworkId | undefined;

  const depositor =
    networkKey !== undefined ? contracts.CashierDeposit[networkKey] : undefined;
  const withdrawer =
    networkKey !== undefined && isEvm(networkKey)
      ? contracts.CashierWithdraw[networkKey]
      : undefined;

  if (networkId?.isSuccess && !depositor) {
    throw new Error(`No contract found for network: ${networkKey}`);
  }

  const type = useMemo(
    () => networkKey && getNetworkType(networkKey),
    [networkKey],
  );

  return {
    type,
    isLoading: networkId.isLoading,
    isSuccess: networkId.isSuccess,
    withdrawer,
    contracts,
    depositor,
  } as UseContracts;
};
