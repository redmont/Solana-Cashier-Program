import { FC, useState, useCallback, useRef, useEffect } from 'react';
import { classNames } from 'primereact/utils';
import { Slider, SliderChangeEvent } from 'primereact/slider';
import { InputNumber, InputNumberChangeEvent } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import dayjs from 'dayjs';

import { Fighter, MatchStatus } from '@/types';
import { matchSeries } from '@/config';
import { useSocket, useAppState, usePostHog } from '@/hooks';
import { PlaceBetMessage } from 'ui-gateway-messages';

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
  const { balance } = useAppState();
  const [error, setError] = useState('');
  const [betPercent, setBetPercent] = useState(0);
  const [betPoints, setBetPoints] = useState(0);
  const [fighter, setFighter] = useState<Fighter>('doge');
  const [timeLeft, setTimeLeft] = useState('00 : 00');
  const [matchTime, setMatchTime] = useState('00 : 00');
  const countdown = useRef<NodeJS.Timeout>();
  const { match } = useAppState();
  const { send } = useSocket();
  const posthog = usePostHog();

  useEffect(() => {
    if (balance < betPoints) {
      setError('Insufficient balance of points');
    } else {
      setError('');
    }
  }, [balance, betPoints]);

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
      const points = evt?.value || 0;
      const percent = balance ? Math.floor((points / balance) * 100) : 0;

      setBetPoints(points);
      setBetPercent(percent);
    },
    [balance],
  );

  const handlePercentChange = useCallback(
    (evt: SliderChangeEvent) => {
      const percent = evt.value as number;
      const points = Math.floor((balance * percent) / 100);

      setBetPercent(percent);
      setBetPoints(points);
    },
    [balance],
  );

  const placeBet = useCallback(async () => {
    await send(new PlaceBetMessage(matchSeries, betPoints, fighter));

    posthog?.capture('Stake Placed', {
      fighter,
      stake: betPoints,
    });
  }, [betPoints, fighter]);

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
                  selected: fighter === 'doge',
                })}
                onClick={() => setFighter('doge')}
              >
                <img src="/doge.svg" />
                DOGE
              </div>

              <span>VS</span>

              <div
                className={classNames('fighter-tile', {
                  selected: fighter === 'pepe',
                })}
                onClick={() => setFighter('pepe')}
              >
                PEPE
                <img src="/pepe.svg" />
              </div>
            </div>
          </div>

          <div className="points-selection">
            <div className="points-slider-box">
              <div className="points-slider-labels">
                <span>0%</span>
                <span>100%</span>
              </div>

              <Slider value={betPercent} onChange={handlePercentChange} />
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
                  <span>{match?.bets[fighter].winRate}x</span>
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
