import { FC, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { classNames } from 'primereact/utils';
import { Slider, SliderChangeEvent } from 'primereact/slider';
import { InputNumber, InputNumberChangeEvent } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import dayjs from 'dayjs';

import { Fighter } from '@/types';
import { useAppState } from '../AppStateProvider';
import { useRewardRates } from '@/hooks/useRewardRates';

export interface BetPlacementWidgetProps {
  compact?: boolean;
}

export const BetPlacementWidget: FC<BetPlacementWidgetProps> = (props) => {
  const { ownedPoints, totalBets, placeBet } = useAppState();
  const [betPercent, setBetPercent] = useState(0);
  const [betPoints, setBetPoints] = useState(0);
  const [fighter, setFighter] = useState<Fighter>('doge');
  const [timeLeft, setTimeLeft] = useState('00 : 00');
  const countdown = useRef<NodeJS.Timeout>();
  const rewardRates = useRewardRates();

  useEffect(() => {
    countdown.current = setInterval(() => {
      const value = dayjs().format('mm[m] : ss[s]');

      setTimeLeft(value);
    }, 1000);

    return () => clearInterval(countdown.current);
  }, []);

  const handlePointsChange = useCallback((evt: InputNumberChangeEvent) => {
    const points = evt?.value || 0;
    const percent = ownedPoints ? Math.floor((points / ownedPoints) * 100) : 0;

    setBetPoints(points);
    setBetPercent(percent);
  }, []);

  const handlePercentChange = useCallback((evt: SliderChangeEvent) => {
    const percent = evt.value as number;
    const points = Math.floor((ownedPoints * percent) / 100);

    setBetPercent(percent);
    setBetPoints(points);
  }, []);

  const winRewards = useMemo(() => {
    const total = totalBets[fighter] ?? 0;

    return total ? Math.floor(betPoints / total) * total : 0;
  }, [totalBets]);

  return (
    <div
      className={classNames('widget bet-placement-widget', {
        compact: props.compact,
      })}
    >
      <div className="widget-header">
        <div className="widget-label">Coming Up Next</div>
        <div className="widget-label">{timeLeft}</div>
      </div>

      <div className="input-section">
        <div className="fighter-selection">
          <div className="selection-title">Choose a fighter</div>
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

        <div className="spacer"></div>

        <div className="points-selection">
          <div className="selection-title">Buy shares in fight pool</div>

          <div className="points-slider-box">
            <div className="points-slider-labels">
              <span>0%</span>
              <span>100%</span>
            </div>

            <Slider value={betPercent} onChange={handlePercentChange} />
          </div>

          <div className="points-input-group p-inputgroup">
            <InputNumber value={betPoints} onChange={handlePointsChange} />

            <span className="p-inputgroup-addon">Points</span>
          </div>

          {props.compact && (
            <Button
              label="Place a Bet"
              size="large"
              className="w-full mt-3"
              disabled={betPoints === 0}
              onClick={() => placeBet(fighter, betPoints)}
            />
          )}
        </div>
      </div>

      {!props.compact && (
        <div className="confirmation-section">
          <div className="bet-preview-title">Bet preview</div>
          <div className="bet-purchase-price flex justify-content-between  text-white">
            <span>Purchased Price:</span>
            <span>{betPoints} points</span>
          </div>

          <div className="bet-win-rewards mt-2 flex justify-content-between text-white">
            <span>Win Rewards:</span>
            <span>{rewardRates[fighter]}x</span>
          </div>

          <div className="spacer"></div>

          <div className="mb-3 text-white">
            Bets cannot be deleted or edited.
            <br />
            You will place a bet without any further confirmations.
          </div>

          <Button
            label="Place a Bet"
            size="large"
            className="w-full"
            disabled={betPoints === 0}
            onClick={() => placeBet(fighter, betPoints)}
          />
        </div>
      )}
    </div>
  );
};
