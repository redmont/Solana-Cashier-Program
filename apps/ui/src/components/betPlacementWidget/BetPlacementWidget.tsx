import {
  FC,
  useState,
  useCallback,
  useRef,
  useEffect,
  MouseEvent,
} from 'react';
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
  [MatchStatus.PendingStart]: 'Pool is closed',
  [MatchStatus.InProgress]: 'Match in progress',
  [MatchStatus.Finished]: 'Match is finished',
};

export const BetPlacementWidget: FC<BetPlacementWidgetProps> = (props) => {
  const { balance, match } = useAppState();
  const [error, setError] = useState('');
  const [isDirty, setDirty] = useState(false);
  const [betPercent, setBetPercent] = useState(25);
  const [betPoints, setBetPoints] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState('00 : 00');
  const [matchTime, setMatchTime] = useState('00 : 00');
  const countdown = useRef<NodeJS.Timeout>();
  const isReady = useRef(false);
  const { send } = useSocket();
  const posthog = usePostHog();

  const { fighters = [] } = match ?? {};
  const selectedFighter = fighters[selectedIndex];
  const winRate = match?.bets[selectedFighter?.codeName]?.winRate ?? 0;

  useEffect(() => {
    if (balance < betPoints) {
      if (isDirty) setError('Insufficient points balance');
      else setBetPoints(Math.floor(balance));
    } else {
      setError('');
    }

    setBetPercent(balance ? Math.floor((betPoints / balance) * 100) : 0);
  }, [balance, betPoints, isDirty]);

  useEffect(() => {
    if (isReady.current) return;

    setBetPoints(Math.floor(balance * 0.25));

    isReady.current = balance > 0;
  }, [balance]);

  useEffect(() => {
    if (!match?.startTime) return;

    countdown.current = setInterval(() => {
      const startTime = dayjs(match.startTime);
      let millisLeft = startTime.diff();
      let millisSince = dayjs().diff(startTime);

      if (millisLeft < 0) millisLeft = 0;

      const timeLeftVal = dayjs.duration(millisLeft).format('mm[m] : ss[s]');
      const matchTimeVal = dayjs.duration(millisSince).format('mm[m] : ss[s]');

      setTimeLeft(timeLeftVal);
      setMatchTime(matchTimeVal);
    }, 1000);

    return () => clearInterval(countdown.current);
  }, [match?.startTime]);

  const handlePointsChange = useCallback(
    (evt: InputNumberChangeEvent) => {
      setBetPoints(evt?.value || 0);
      setDirty(true);
    },
    [balance],
  );

  const handlePercentChange = useCallback(
    (percent: number) => {
      console.log('Balance:', balance);
      console.log(`${percent}%`);
      const points = Math.floor((balance * percent) / 100);

      console.log('Points:', points);
      setBetPercent(percent);
      setBetPoints(points);
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
      new PlaceBetMessage(match?.series, betPoints, selectedFighter.codeName),
    );

    posthog?.capture('Stake Placed', {
      fighter: selectedFighter.codeName,
      stake: betPoints,
    });
  }, [match?.series, betPoints, selectedFighter?.codeName]);

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

          <div className="points-selection">
            <div className="points-slider-box">
              <div className="points-slider-labels">
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

            <div className="points-input-group p-inputgroup">
              <InputNumber
                className="points-input"
                value={betPoints}
                onChange={handlePointsChange}
              />

              <span className="p-inputgroup-addon points-label">Points</span>
            </div>

            {props.compact && (
              <Button
                label="Confirm"
                size="large"
                className="w-full mt-3 confirm-button-compact"
                disabled={
                  betPoints === 0 || match?.status !== MatchStatus.BetsOpen
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
                  <span>{betPoints} points</span>
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
                  betPoints === 0 ||
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
