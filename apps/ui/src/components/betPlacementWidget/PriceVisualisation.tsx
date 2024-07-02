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
  const deltasRef = useRef<number[]>([0.5, 0.5]);
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

    if (deltas[0] === 0 || deltas[1] === 0) {
      // one positive, one zero
      deltas = deltas.map((d, i) => (d + diff) * deltasRef.current[i]);
    }

    const total = deltas[0] + deltas[1];
    deltas = deltas.map((d) => d / total || 0.5);
    deltasRef.current = deltas;
    const progress = deltas[0];

    setProgress(progress || 0.5);
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
        {fighters.map((fighter, i) => {
          const ticker = fighter.ticker;
          const price = prices?.get(ticker);
          let direction =
            !price || price.change.absolute === 0
              ? 'none'
              : price.change.absolute > 0
                ? 'up'
                : 'down';
          const displayPrice = `${Math.abs(price ? price.change.ppm : 0).toFixed(2)}ppm`;
          return (
            <>
              <Tooltip
                content={`[LIVE] ${ticker} price change over ${LOCAL_PRICE_CACHE_PERIOD / 1000}s \n ppm = 0.0001%`}
                key={ticker}
              >
                <div
                  className={classNames('price-info', direction)}
                  style={{ flexDirection: `row${i === 1 ? '-reverse' : ''}` }}
                >
                  <span className="price-ticker">{`${ticker}`}</span>
                  <span className="price-value">{`${displayPrice}`}</span>
                  <i
                    className={classNames(
                      'price-change-indicator pi',
                      direction === 'none'
                        ? 'pi-minus'
                        : `pi-sort-${direction}-fill`,
                    )}
                  ></i>
                </div>
              </Tooltip>
              {i === 0 && (
                <div className="price-info-indicator pi pi-wave-pulse"></div>
              )}
            </>
          );
        })}
      </div>
    </div>
  );
};
