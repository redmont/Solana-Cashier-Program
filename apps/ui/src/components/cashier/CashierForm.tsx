import { FC, useCallback, useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

import { AmountSelectionForm } from './AmountSelectionForm';
import { PricedCredits } from './utils';
import { PurchaseForm } from './PurchaseForm';
import { X } from 'lucide-react';
import { PurchaseFormSolana } from './PurchaseFormSolana';

type Props = {
  onClose?: () => void;
};

export const CashierForm: FC<Props> = ({ onClose }) => {
  const { primaryWallet } = useDynamicContext();

  const [state, setState] = useState<
    'selectAmount' | 'allowance' | 'completed'
  >('selectAmount');
  const [credits, setCredits] = useState<PricedCredits>({
    credits: 0,
    amount: 0,
    pricePerCredit: 0,
  });

  const onAmountSelected = useCallback((priced: PricedCredits) => {
    setCredits(priced);
    setState('allowance');
  }, []);

  const onPurchaseCompleted = useCallback(() => {
    setState('completed');
    onClose?.();
  }, [onClose]);

  const reset = useCallback(() => {
    setState('selectAmount');
  }, []);

  return (
    <div className="relative">
      <div className="absolute -right-3 -top-3">
        <button className="rounded-full p-1 hover:bg-text/10" onClick={onClose}>
          <X />
        </button>
      </div>

      {state === 'selectAmount' && (
        <AmountSelectionForm onSubmit={onAmountSelected} />
      )}
      {state === 'allowance' &&
        (primaryWallet?.chain === 'solana' ? (
          <PurchaseFormSolana
            credits={credits}
            onPurchaseCompleted={onPurchaseCompleted}
            onClose={reset}
          />
        ) : (
          <PurchaseForm
            credits={credits}
            onPurchaseCompleted={onPurchaseCompleted}
            onClose={reset}
          />
        ))}
    </div>
  );
};
