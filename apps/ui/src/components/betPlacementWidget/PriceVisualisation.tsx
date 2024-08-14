import { cn as classNames } from '@/lib/utils';
import { FC, Fragment, useEffect, useRef, useState } from 'react';
import { Tooltip } from '../Tooltip';
import { toScientificParts } from '@/utils';
import { useAtomValue } from 'jotai';
import { fightersAtom, priceMovementAverages } from '@/store/match';

interface PriceVisualisationProps {
  disabled: boolean;
}

export const PriceVisualisation: FC<PriceVisualisationProps> = ({
  disabled,
}) => {
  const fighters = useAtomValue(fightersAtom);
  const priceMovements = useAtomValue(priceMovementAverages);
  const [progress, setProgress] = useState(0.5);
  const [isWinner, setIsWinner] = useState([false, false]);
  const deltasRef = useRef<number[]>([0.5, 0.5]);

  useEffect(() => {
    let deltas = priceMovements.map(
      (priceMovement) => priceMovement.priceMovementAverage,
    );

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
    const progress = deltas[1];
    setIsWinner([progress < 0.5, progress > 0.5]);

    setProgress(progress);
  }, [fighters, priceMovements]);

  return (
    <div className={classNames('price-visualisation', { disabled })}>
      <div className="price-info-container">
        {priceMovements.map(({ priceDelta, price, ticker }, i) => {
          const direction =
            priceDelta === 0 ? 'none' : priceDelta > 0 ? 'up' : 'down';

          const priceInScientificNotation = toScientificParts(price);
          const displayPrice = `${priceInScientificNotation.base.toFixed(5)}`;
          return (
            <Fragment key={`${ticker}-${i}`}>
              <Tooltip
                content={
                  <div>
                    <span>
                      Price is scaled by 10
                      <sup>{priceInScientificNotation.exponent * -1}</sup>
                    </span>
                  </div>
                }
                key={ticker}
                disabled={disabled}
              >
                <div
                  className={classNames('price-info', direction, { disabled })}
                  style={{
                    flexDirection: `row${i === 1 ? '-reverse' : ''}`,
                    fontWeight: isWinner[i] ? 'bold' : 'normal',
                  }}
                >
                  <span className="price-ticker">{ticker}</span>
                  <span className="price-value">{`$${displayPrice}`}</span>
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
                <Tooltip content={`LIVE PRICE`}>
                  <div className="price-info-indicator pi pi-wave-pulse"></div>
                </Tooltip>
              )}
            </Fragment>
          );
        })}
      </div>

      <Tooltip content={'Trailing 10s price Δ'}>
        <div className="tow-container">
          <div className="tow-line"></div>
          {!disabled ? (
            <div
              className="tow-indicator"
              style={{ left: `${10 + progress * 80}%` }}
            ></div>
          ) : (
            <div
              className="tow-indicator"
              style={{ left: "50%" }}
            ></div>
          )}
        </div>
      </Tooltip>
    </div>
  );
};
