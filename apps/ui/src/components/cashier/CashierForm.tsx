import { FC, useCallback, useState } from 'react';

import { AmountSelectionForm } from './AmountSelectionForm';
import { CreditAmount } from './utils';
import { PurchaseForm } from './PurchaseForm';
import { X } from 'lucide-react';

type Props = {
  onClose?: () => void;
};

export const CashierForm: FC<Props> = ({ onClose }) => {
  const [state, setState] = useState<
    'selectAmount' | 'allowance' | 'completed'
  >('selectAmount');
  const [credits, setCredits] = useState<CreditAmount>({ amount: 0, price: 0 });

  const onAmountSelected = useCallback((credits: CreditAmount) => {
    setCredits(credits);
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
      <div className="absolute -right-2 -top-2">
        <button className="rounded-full p-1 hover:bg-text/10" onClick={onClose}>
          <X />
        </button>
      </div>

      {state === 'selectAmount' && (
        <AmountSelectionForm onSubmit={onAmountSelected} />
      )}
      {state === 'allowance' && (
        <PurchaseForm
          credits={credits}
          onPurchaseCompleted={onPurchaseCompleted}
          onClose={reset}
        />
      )}
    </div>
  );
};
