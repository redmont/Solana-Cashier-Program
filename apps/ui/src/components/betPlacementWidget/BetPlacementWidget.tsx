'use client';

import {
  FC,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ChangeEventHandler,
} from 'react';
import { Button } from '@/components/ui/button';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useAtom, useAtomValue } from 'jotai';

import { Slider } from '../slider';
import { useSocket, usePostHog, useWallet, useSfx } from '@/hooks';
import { PlaceBetMessage } from '@bltzr-gg/brawlers-ui-gateway-messages';
import { FighterSwitch } from './FighterSwitch';
import { PriceVisualisation } from './PriceVisualisation';
import { Tooltip } from '../Tooltip';
import { balanceAtom, usdBalanceAtom } from '@/store/account';
import {
  matchSeriesAtom,
  matchStatusAtom,
  poolOpenStartTimeAtom,
} from '@/store/match';
import {
  betAmountAtom,
  selectedFighterAtom,
  selectedFighterIndexAtom,
  winningRatesWithBetAmountAtom,
} from '@/store/app';
import Typography from '../ui/typography';
import { Input } from '../ui/input';
import dayjs from 'dayjs';
import { CREDITS_DECIMALS } from '@/config/credits';
import { getPrice } from '../cashier/utils';
import { VIPOrderBook } from '@/types';
import { orderBookAtom } from '@/store/view';

export const BetPlacementWidget: FC = () => {
  const [actionTitle, setActionTitle] = useState('Join the Fight');
  const balance = useAtomValue(balanceAtom);
  const usdBalance = useAtomValue(usdBalanceAtom);
  const matchSeries = useAtomValue(matchSeriesAtom);
  const matchStatus = useAtomValue(matchStatusAtom);
  const poolOpenStartTime = useAtomValue(poolOpenStartTimeAtom);
  const [projectedWinRate1, projectedWinRate2] = useAtomValue(
    winningRatesWithBetAmountAtom,
  );
  const [betAmount, setBetAmount] = useAtom(betAmountAtom);

  const selectedFighter = useAtomValue(selectedFighterAtom);
  const selectedFighterIndex = useAtomValue(selectedFighterIndexAtom);

  const { isConnected, isAuthenticated } = useWallet();
  const { setShowAuthFlow } = useDynamicContext();
  const [error, setError] = useState('');
  const [isDirty, setDirty] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [betPercent, setBetPercent] = useState(25);
  const { send } = useSocket();
  const posthog = usePostHog();
  const isBalanceReady = balance !== undefined;
  const [inputValue, setInputValue] = useState('');
  const orderBook = useAtomValue(orderBookAtom);

  const sfx = useSfx();

  const updateBetAmount = useCallback(
    (newBalance: number, newPercent: number) => {
      const newAmount = Math.min(
        Number(((newBalance * newPercent) / 100).toFixed(2)),
        newBalance,
      );
      setBetAmount(newAmount);
      setBetPercent(newPercent);
      setInputValue(newAmount.toFixed(2));
    },
    [setBetAmount],
  );

  useEffect(() => {
    if (usdBalance !== undefined) {
      const maxBet = Number(usdBalance.toFixed(2));
      if (betAmount > maxBet) {
        if (isDirty) {
          setError('Insufficient balance');
        } else {
          updateBetAmount(maxBet, (betAmount / maxBet) * 100);
        }
      } else {
        setError('');
      }
    }

    setBetPercent(usdBalance ? Math.floor((betAmount / usdBalance) * 100) : 0);
  }, [usdBalance, betAmount, isDirty, updateBetAmount, betPercent]);

  useEffect(() => {
    if (!isAuthenticated || isBalanceReady) {
      setLoading(false);
    }

    if (betAmount > 0 || (isAuthenticated && !isBalanceReady)) {
      return;
    }

    const initialBetAmount = Number(((usdBalance ?? 0) * 0.25).toFixed(2));
    setBetAmount(initialBetAmount);
    setInputValue(initialBetAmount.toFixed(2));

    // We only need to track isBalanceReady
    // to apply this once balance is fetched from server
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBalanceReady, isAuthenticated]);

  const handleBetAmountChange = useCallback<
    ChangeEventHandler<HTMLInputElement>
  >(
    (evt) => {
      setDirty(true);
      const newValue = evt.target.value;
      setInputValue(newValue);
      const newAmount = Math.min(parseFloat(newValue) || 0, usdBalance || 0);
      setBetAmount(newAmount);
      if (usdBalance) {
        setBetPercent(
          Math.min(Math.floor((newAmount / usdBalance) * 100), 100),
        );
      }
    },
    [setBetAmount, usdBalance],
  );

  const handlePercentChange = useCallback(
    (percent: number) => {
      setDirty(true);
      updateBetAmount(usdBalance ?? 0, percent);
    },
    [usdBalance, updateBetAmount],
  );

  const placeBet = useCallback(async () => {
    if (!matchSeries || !selectedFighter?.codeName) {
      return;
    }

    sfx.stakePlaced();
    setLoading(true);

    await send(
      new PlaceBetMessage(
        matchSeries,
        betAmount * 10 ** CREDITS_DECIMALS,
        selectedFighter.codeName,
        orderBook === VIPOrderBook,
      ),
    );

    sfx.stakeConfirmed();
    setLoading(false);
    const newBalanceInCredits =
      (balance ?? 0) - Math.floor(betAmount * 10 ** CREDITS_DECIMALS);
    const newUsdBalance = getPrice(newBalanceInCredits);
    updateBetAmount(newUsdBalance, betPercent);

    posthog?.capture('Stake Placed', {
      fighter: selectedFighter.codeName,
      stake: Math.floor(betAmount * 10 ** CREDITS_DECIMALS),
      balance: usdBalance,
      winRate:
        selectedFighterIndex === 0 ? projectedWinRate1 : projectedWinRate2,
      relativeTime: dayjs().diff(dayjs(poolOpenStartTime)),
    });
  }, [matchSeries, selectedFighter?.codeName, send, betAmount, posthog, sfx]);

  const join = useCallback(() => setShowAuthFlow(true), [setShowAuthFlow]);

  useEffect(() => {
    if (isLoading && (!isAuthenticated || !isBalanceReady)) {
      return setActionTitle('Loading');
    }

    if (!isAuthenticated) {
      return setActionTitle('Join the Fight');
    }

    return setActionTitle(isLoading ? 'Processing' : 'Confirm');
  }, [isLoading, isAuthenticated, isBalanceReady]);

  const isDisabled = useMemo(() => {
    return isLoading || (matchStatus !== 'bettingOpen' && isConnected);
  }, [isLoading, matchStatus, isConnected]);

  const isDisabledBet = useMemo(() => {
    return (
      isLoading ||
      !!error ||
      ((betAmount === 0 || matchStatus !== 'bettingOpen') && isConnected)
    );
  }, [isLoading, error, betAmount, matchStatus, isConnected]);

  const disabledReason = useMemo(() => {
    if (isLoading) {
      return 'Loading...';
    }
    if (error) {
      return error;
    }
    if (betAmount === 0) {
      return 'Bet amount must be greater than 0';
    }
    if (matchStatus !== 'bettingOpen') {
      return 'Bets are closed during the fight';
    }
    return '';
  }, [isLoading, error, betAmount, matchStatus]);

  return (
    <div className="widget bet-placement-widget">
      <div className="widget-body framed">
        <Tooltip
          content={isDisabled ? disabledReason : ''}
          disabled={!isDisabled}
        >
          <div className="widget-section">
            <div className="fighter-selection">
              <Typography variant="header-secondary" className="left">
                Back your fighter
              </Typography>

              <PriceVisualisation disabled={isDisabled} />
              <FighterSwitch disabled={isDisabled} />
              <Tooltip
                content={`Your projected win rate once you confirm your stake`}
              >
                <div className="projected-win-rate">
                  <span>{projectedWinRate1}x</span>
                  <span>Win Rate</span>
                  <span>{projectedWinRate2}x</span>
                </div>
              </Tooltip>
            </div>

            <div className="credits-selection">
              <div className="credits-slider-box">
                <span>1%</span>

                <Slider
                  value={betPercent}
                  onChange={handlePercentChange}
                  min={1}
                  marks={[25, 50, 75]}
                  disabled={isLoading || isDisabled}
                />

                <span>100%</span>
              </div>

              <Input
                startAdornment="$"
                className="my-6 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                value={inputValue}
                onChange={handleBetAmountChange}
                disabled={isLoading}
                onBlur={() => setInputValue(betAmount.toFixed(2))}
                type="number"
              />

              <div className="mt-2 text-sm">
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
                className="mt-3 w-full text-lg"
                disabled={isDisabledBet}
                onClick={isConnected ? placeBet : join}
              >
                {actionTitle}
              </Button>
            </div>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};
