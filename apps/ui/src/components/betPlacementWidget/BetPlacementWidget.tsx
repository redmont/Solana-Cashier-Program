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
import { balanceAtom } from '@/store/account';
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

export const BetPlacementWidget: FC = () => {
  const [actionTitle, setActionTitle] = useState('Join the Fight');
  const balance = useAtomValue(balanceAtom);
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

  const sfx = useSfx();

  useEffect(() => {
    if (balance !== undefined && balance < betAmount) {
      if (isDirty) {
        setError('Insufficient credits balance');
      } else {
        setBetAmount(Math.floor(balance));
      }
    } else {
      setError('');
    }

    setBetPercent(balance ? Math.floor((betAmount / balance) * 100) : 0);
  }, [balance, betAmount, isDirty, setBetAmount]);

  useEffect(() => {
    if (!isAuthenticated || isBalanceReady) {
      setLoading(false);
    }

    if (betAmount > 0 || (isAuthenticated && !isBalanceReady)) {
      return;
    }

    setBetAmount(Math.floor((balance ?? 0) * 0.25));

    // We only need to track isBalanceReady
    // to apply this once balance is fetched from server
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBalanceReady, isAuthenticated]);

  const handleBetAmountChange = useCallback<
    ChangeEventHandler<HTMLInputElement>
  >(
    (evt) => {
      setDirty(true);
      setBetAmount(parseFloat(evt.target.value) || 0);
    },
    [setBetAmount],
  );

  const handlePercentChange = useCallback(
    (percent: number) => {
      const amount = Math.floor(((balance ?? 0) * percent) / 100);

      setDirty(true);
      setBetPercent(percent);
      setBetAmount(amount);
    },
    [balance, setBetAmount],
  );

  const placeBet = useCallback(async () => {
    if (!matchSeries || !selectedFighter?.codeName) {
      return;
    }

    sfx.stakePlaced();
    setLoading(true);

    await send(
      new PlaceBetMessage(matchSeries, betAmount, selectedFighter.codeName),
    );

    sfx.stakeConfirmed();
    setLoading(false);

    posthog?.capture('Stake Placed', {
      fighter: selectedFighter.codeName,
      stake: betAmount,
      balance,
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
                endAdornment="Credits"
                className="my-6"
                value={betAmount}
                onChange={handleBetAmountChange}
                disabled={isLoading}
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
