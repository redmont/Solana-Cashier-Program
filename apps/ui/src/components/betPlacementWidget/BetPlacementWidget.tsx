import { FC, useState, useCallback, useRef, useEffect } from 'react';
import { classNames } from 'primereact/utils';
import { InputNumber, InputNumberChangeEvent } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import dayjs from 'dayjs';

import { MatchStatus } from '@/types';
import { Slider } from '../slider';
import { useSocket, useAppState, usePostHog } from '@/hooks';
import { PlaceBetMessage } from '@bltzr-gg/brawlers-ui-gateway-messages';

export interface BetPlacementWidgetProps {
  compact?: boolean;
}

const matchStatusText: Record<MatchStatus, string> = {
  [MatchStatus.Unknown]: 'Unknown',
  [MatchStatus.BetsOpen]: 'Pool is open',
  [MatchStatus.PendingStart]: 'Match starting soon',
  [MatchStatus.InProgress]: 'Match in progress',
  [MatchStatus.Finished]: 'Match is finished',
};

export const BetPlacementWidget: FC<BetPlacementWidgetProps> = (props) => {
  const { balance, match } = useAppState();
  const [error, setError] = useState('');
  const [isDirty, setDirty] = useState(false);
  const [betPercent, setBetPercent] = useState(25);
  const [betCredits, setBetCredits] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState('00 : 00');
  const [matchTime, setMatchTime] = useState('00 : 00');
  const countdown = useRef<NodeJS.Timeout>();
  const isReady = useRef(false);
  const { send } = useSocket();
  const posthog = usePostHog();

  const { fighters = [] } = match ?? {};
  const selectedFighter = fighters[selectedIndex];
  const { stake = 0, projectWinRate } =
    match?.bets[selectedFighter?.codeName] ?? {};

  const totalStake = stake + betCredits;
  const winRate = projectWinRate?.(betCredits);

  useEffect(() => {
    if (balance < betCredits) {
      if (isDirty) setError('Insufficient credits balance');
      else setBetCredits(Math.floor(balance));
    } else {
      setError('');
    }

    setBetPercent(balance ? Math.floor((betCredits / balance) * 100) : 0);
  }, [balance, betCredits, isDirty]);

  useEffect(() => {
    if (isReady.current) return;

    setBetCredits(Math.floor(balance * 0.25));

    isReady.current = balance > 0;
  }, [balance]);

  useEffect(() => {
    if (!match?.startTime) return;

    countdown.current = setInterval(() => {
      const startTime = dayjs(match.startTime);
      let millisLeft = startTime.diff();
      const millisSince = dayjs().diff(startTime);

      if (millisLeft < 0) millisLeft = 0;

      const timeLeftVal = dayjs.duration(millisLeft).format('mm[m] : ss[s]');
      const matchTimeVal = dayjs.duration(millisSince).format('mm[m] : ss[s]');

      setTimeLeft(timeLeftVal);
      setMatchTime(matchTimeVal);
    }, 1000);

    return () => clearInterval(countdown.current);
  }, [match?.startTime]);

  const handleCreditsChange = useCallback((evt: InputNumberChangeEvent) => {
    setBetCredits(evt?.value || 0);
    setDirty(true);
  }, []);

  const handlePercentChange = useCallback(
    (percent: number) => {
      const credits = Math.floor((balance * percent) / 100);

      setBetPercent(percent);
      setBetCredits(credits);
      setDirty(true);
    },
    [balance],
  );

  const placeBet = useCallback(async () => {
    if (!match?.series || !selectedFighter?.codeName) {
      return;
    }

    setDirty(false);

    await send(
      new PlaceBetMessage(match?.series, betCredits, selectedFighter.codeName),
    );

    posthog?.capture('Stake Placed', {
      fighter: selectedFighter.codeName,
      stake: betCredits,
    });
  }, [match?.series, betCredits, selectedFighter?.codeName, posthog, send]);

  return (
    <div
      className={classNames('widget bet-placement-widget', {
        compact: props.compact,
      })}
    >
      <div className="widget-body framed">
        <div className="widget-header">
          {match?.status && (
            <div className="widget-label">
              {matchStatusText[match?.status || MatchStatus.Unknown]}
            </div>
          )}

          {match?.status === MatchStatus.BetsOpen && (
            <div className="widget-label match-timer">{timeLeft}</div>
          )}

          {match?.status === MatchStatus.InProgress && (
            <div className="widget-label match-timer">{matchTime}</div>
          )}
        </div>

        <div className="widget-section">
          <div className="fighter-selection">
            <div className="selection-title">Back your fighter</div>

            <div className="fighter-switch">
              <div
                className={classNames('fighter-tile', {
                  selected: selectedIndex === 0,
                })}
                onClick={() => setSelectedIndex(0)}
              >
                <img src={fighters[0]?.imageUrl} />
                {fighters[0]?.displayName}
              </div>

              <span>VS</span>

              <div
                className={classNames('fighter-tile', {
                  selected: selectedIndex === 1,
                })}
                onClick={() => setSelectedIndex(1)}
              >
                {fighters[1]?.displayName}
                <img src={fighters[1]?.imageUrl} />
              </div>
            </div>
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
                value={betCredits}
                onChange={handleCreditsChange}
              />

              <span className="p-inputgroup-addon credits-label">Credits</span>
            </div>

            {props.compact && (
              <Button
                label="Confirm"
                size="large"
                className="w-full mt-3 confirm-button-compact"
                disabled={
                  betCredits === 0 || match?.status !== MatchStatus.BetsOpen
                }
                onClick={placeBet}
              />
            )}
          </div>
        </div>

        {!props.compact && (
          <div className="widget-section">
            <div className="bet-preview">
              <div className="bet-preview-title">Preview</div>

              <div className="bet-preview-items">
                <div className="bet-purchase-price flex justify-content-between text-white">
                  <span>Stake amount:</span>
                  <span>{totalStake} credits</span>
                </div>

                <div className="bet-win-rewards flex justify-content-between text-white">
                  <span>Current win rate:</span>
                  <span>{winRate}x</span>
                </div>
              </div>
            </div>

            <div className="bet-confirmation">
              {!error && (
                <div className="text-sm text-600 mb-2">
                  Stakes are locked until the end of the fight.
                </div>
              )}

              {error && (
                <div className="text-sm mb-2 text-red-500">{error}</div>
              )}

              <Button
                label="Confirm"
                size="large"
                className="w-full text-base"
                disabled={
                  !!error ||
                  betCredits === 0 ||
                  match?.status !== MatchStatus.BetsOpen
                }
                onClick={placeBet}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
