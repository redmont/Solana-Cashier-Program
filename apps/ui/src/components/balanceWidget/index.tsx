import { cn } from '@/lib/utils';
import {
  balanceAtom,
  usdBalanceAtom,
  sufficientBalanceForWithdrawalsAtom,
} from '@/store/account';
import { useAtomValue } from 'jotai';
import { FC } from 'react';
import { Button } from '../ui/button';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import B3Spinner from '../B3Spinner/B3Spinner';
import { MINIMUM_USD_WITHDRAWAL } from '@/config/withdrawals';
import WithdrawalModal from '../modals/WithdrawalModal';

const BalanceWidget: FC<{ className?: string }> = ({ className }) => {
  const withdrawalsFeature = useFeatureFlag('withdrawals');
  const sufficientBalanceForWithdrawal = useAtomValue(
    sufficientBalanceForWithdrawalsAtom,
  );
  const balance = useAtomValue(balanceAtom);
  const usdBalance = useAtomValue(usdBalanceAtom);

  return (
    <div
      className={cn(
        'flex min-h-64 flex-col gap-4 rounded-md border border-border bg-foreground p-5',
        className,
      )}
    >
      <h2 className="text-xl font-semibold leading-none text-white">Balance</h2>

      {balance === undefined ? (
        <div className="flex grow flex-col items-center justify-center gap-2">
          <B3Spinner size="lg" />
        </div>
      ) : (
        <div className="flex grow flex-col items-center justify-center gap-3">
          <div className="text-5xl font-semibold text-white">
            ${usdBalance?.toFixed(2)}
          </div>
          {!sufficientBalanceForWithdrawal && (
            <div className="text-center">
              Keep playing! ${MINIMUM_USD_WITHDRAWAL} needed to cash out
            </div>
          )}
        </div>
      )}
      <WithdrawalModal>
        <Button
          disabled={!withdrawalsFeature || !sufficientBalanceForWithdrawal}
          variant="outline-secondary"
          className="w-full"
        >
          Withdraw
        </Button>
      </WithdrawalModal>
    </div>
  );
};

export default BalanceWidget;
