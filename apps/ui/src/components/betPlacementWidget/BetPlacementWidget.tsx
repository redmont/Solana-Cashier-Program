import { FC, useState, useCallback, useEffect, useMemo, Fragment } from 'react';
import { classNames } from 'primereact/utils';
import { InputNumber, InputNumberChangeEvent } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

import { Fighter, MatchStatus } from '@/types';
import { Slider } from '../slider';
import { useSocket, useAppState, usePostHog, useEthWallet } from '@/hooks';
import { PlaceBetMessage } from '@bltzr-gg/brawlers-ui-gateway-messages';
import { FighterSwitch } from './FighterSwitch';
import { PriceVisualisation } from './PriceVisualisation';

export interface BetPlacementWidgetProps {
  fighter: number; // 0 or 1
  betAmount: number;
  onBetChange: (amount: number) => void;
  onFighterChange: (fighter: number) => void;
}

export const BetPlacementWidget: FC<BetPlacementWidgetProps> = ({
  onBetChange,
  onFighterChange,
  ...props
}) => {
  const { isConnected, isAuthenticated } = useEthWallet();
  const { setShowAuthFlow } = useDynamicContext();
  const { isBalanceReady, balance, match } = useAppState();
  const { fighters = [] } = match ?? {};
  const [error, setError] = useState('');
  const [isDirty, setDirty] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [betPercent, setBetPercent] = useState(25);
  const { send } = useSocket();
  const posthog = usePostHog();

  const betAmount = props.betAmount ?? 0;
  const selectedFighter = fighters.at(props.fighter);

  useEffect(() => {
    if (balance < betAmount) {
      if (isDirty) setError('Insufficient credits balance');
      else onBetChange(Math.floor(balance));
    } else {
      setError('');
    }

    setBetPercent(balance ? Math.floor((betAmount / balance) * 100) : 0);
  }, [balance, betAmount, isDirty, onBetChange]);

  useEffect(() => {
    if (!isAuthenticated || isBalanceReady) {
      setLoading(false);
    }

    if (props.betAmount > 0 || (isAuthenticated && !isBalanceReady)) return;

    onBetChange(Math.floor(balance * 0.25));

    // We only need to track isBalanceReady
    // to apply this once balance is fetched from server
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBalanceReady, isAuthenticated, onBetChange]);

  const handleFighterChange = useCallback(
    (fighter: number) => {
      onFighterChange(fighter);
    },
    [onFighterChange],
  );

  const handleBetAmountChange = useCallback(
    (evt: InputNumberChangeEvent) => {
      onBetChange(evt?.value || 0);
      setDirty(true);
    },
    [onBetChange],
  );

  const handlePercentChange = useCallback(
    (percent: number) => {
      const amount = Math.floor((balance * percent) / 100);

      setBetPercent(percent);
      onBetChange(amount);
      setDirty(true);
    },
    [balance, onBetChange],
  );

  const placeBet = useCallback(async () => {
    if (!match?.series || !selectedFighter?.codeName) {
      return;
    }

    setDirty(false);
    setLoading(true);

    await send(
      new PlaceBetMessage(match?.series, betAmount, selectedFighter.codeName),
    );

    setLoading(false);

    posthog?.capture('Stake Placed', {
      fighter: selectedFighter.codeName,
      stake: betAmount,
    });
  }, [match?.series, betAmount, selectedFighter?.codeName, posthog, send]);

  const join = useCallback(() => setShowAuthFlow(true), [setShowAuthFlow]);

  const actionTitle = useMemo(() => {
    if (isLoading && (!isAuthenticated || !isBalanceReady)) {
      return 'Loading';
    }

    if (!isAuthenticated) {
      return 'Join the Fight';
    }

    return isLoading ? 'Processing' : 'Confirm';
  }, [isLoading, isAuthenticated, isBalanceReady]);

  return (
    <div className="widget bet-placement-widget">
      <div className="widget-body framed">
        <div className="widget-section">
          <div className="fighter-selection">
            <div className="selection-title">Back your fighter</div>

            <PriceVisualisation fighters={fighters} match={match} />

            <FighterSwitch
              fighters={fighters}
              selectedFighter={selectedFighter}
              handleFighterChange={handleFighterChange}
            />
          </div>

          <div className="credits-selection">
            <div className="credits-slider-box">
              <div className="credits-slider-labels">
                <span>1%</span>
                <span>100%</span>
              </div>

              <Slider
                value={betPercent}
                onChange={handlePercentChange}
                min={1}
                marks={[25, 50, 75]}
              />
            </div>

            <div className="credits-input-group p-inputgroup">
              <InputNumber
                className="credits-input"
                value={betAmount}
                onChange={handleBetAmountChange}
              />

              <span className="p-inputgroup-addon credits-label">Credits</span>
            </div>

            <div className="text-sm mt-2">
              {error ? (
                <span className="text-red-500">{error}</span>
              ) : (
                <span className="text-600">
                  Stakes are locked until the end of the fight.
                </span>
              )}
            </div>

            <Button
              loading={isLoading}
              label={actionTitle}
              size="large"
              className="button-place w-full mt-3 confirm-button-compact"
              disabled={
                isLoading ||
                !!error ||
                ((betAmount === 0 || match?.status !== MatchStatus.BetsOpen) &&
                  isConnected)
              }
              onClick={isConnected ? placeBet : join}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
