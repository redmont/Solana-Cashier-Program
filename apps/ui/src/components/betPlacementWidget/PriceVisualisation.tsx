import { MatchInfo } from '@/hooks';
import { Fighter } from '@/types';
import { classNames } from 'primereact/utils';
import { FC, useEffect, useRef, useState } from 'react';
import { Tooltip } from '../Tooltip';
import { LOCAL_PRICE_CACHE_PERIOD } from '@/config';

interface Props {
  fighters: Fighter[];
  prices?: MatchInfo['prices'];
}

export const PriceVisualisation: FC<Props> = ({ fighters, prices }) => {
  const [progress, setProgress] = useState(0.5);
  const deltasRef = useRef<number[]>([]);
  useEffect(() => {
    const tickers = fighters.map((fighter) => fighter.ticker);
    let deltas = tickers.map((ticker) => prices?.get(ticker)?.change.ppm ?? 0);

    const min = Math.min(...deltas);
    const max = Math.max(...deltas);
    const diff = Math.abs(max - min);

    if (deltas.every((d) => d <= 0)) {
      // all negative
      deltas = deltas.map((d) => d * -1).reverse();
    } else if (deltas[0] * deltas[1] < 0) {
      // one positive, one negative
      deltas = deltas.map((d) => d + diff);
    }

    if (deltas[0] * deltas[1] === 0) {
      // one positive, one zero
      deltas = deltas.map((d, i) => (d + diff) * deltasRef.current[i]);
    }

    const total = deltas[0] + deltas[1];
    deltas = deltas.map((d) => d / total);
    deltasRef.current = deltas;
    const progress = deltas[0];

    setProgress(Number.isNaN(progress) ? 0.5 : progress);
  }, [prices]);

  return (
    <div className="price-visualisation">
      <div className="progress-bar-container">
        <div
          className="progress-bar"
          style={{ width: `${progress * 100}%` }}
        ></div>
      </div>

      <div className="price-info-container">
        {fighters.map((fighter) => {
          const price = prices?.get(fighter.ticker);
          let direction =
            !price || price.change.absolute === 0
              ? 'none'
              : price.change.absolute > 0
                ? 'up'
                : 'down';
          const displayPrice = `${Math.abs(price ? price.change.ppm : 0).toFixed(2)}ppm`;
          return (
            <Tooltip
              content={`[LIVE] ${fighter.ticker} price change over ${LOCAL_PRICE_CACHE_PERIOD / 1000}s \n ppm = 0.0001%`}
              key={fighter.ticker}
            >
              <div className={classNames('price-info', direction)}>
                <span className="price-ticker">${fighter.ticker}</span>
                <span className="price-value">{`${displayPrice}`}</span>
                <i
                  className={classNames(
                    'price-change-indicator pi',
                    direction === 'none'
                      ? 'pi-wave-pulse'
                      : `pi-sort-${direction}-fill`,
                  )}
                ></i>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
