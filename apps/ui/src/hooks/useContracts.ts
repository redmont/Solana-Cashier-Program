import { useWallet } from '@/hooks';
import contracts from '@bltzr-gg/brawlers-evm-contracts/exports';

export const useContracts = () => {
  const { networkId } = useWallet();

  const networkKey = networkId?.data as
    | keyof typeof contracts.CashierDeposit
    | keyof typeof contracts.CashierWithdraw
    | undefined;

  const depositor =
    networkKey !== undefined ? contracts.CashierDeposit[networkKey] : undefined;
  const withdrawer =
    networkKey !== undefined
      ? contracts.CashierWithdraw[networkKey]
      : undefined;

  if (networkId?.isSuccess && !depositor) {
    //throw new Error(`No contract found for network ${networkKey}`);
  }

  return {
    isLoading: networkId.isLoading,
    isSuccess: networkId.isSuccess,
    depositor,
    withdrawer,
    contracts,
  };
};
