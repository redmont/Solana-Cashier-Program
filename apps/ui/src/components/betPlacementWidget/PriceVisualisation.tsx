import { MatchInfo } from '@/hooks';
import { Fighter } from '@/types';
import { formatNumber } from '@/utils';
import { classNames } from 'primereact/utils';
import { FC } from 'react';
import { Tooltip } from '../Tooltip';
import { LOCAL_PRICE_CACHE_PERIOD } from '@/config';

interface Props {
  fighters: Fighter[];
  match: MatchInfo | null;
}

export const PriceVisualisation: FC<Props> = ({ fighters, match }) => {
  return (
    <div className="price-visualisation">
      {fighters.map((fighter) => {
        const price = match?.prices.get(fighter.ticker);

        let direction =
          !price || price.change.absolute === 0
            ? 'none'
            : price.change.absolute > 0
              ? 'up'
              : 'down';

        const displayPrice = formatNumber({
          number: Math.abs(price ? price.change.bps : 0),
          decimals: 4,
        });

        return (
          <Tooltip
            content={`[LIVE] ${fighter.ticker} price change over ${LOCAL_PRICE_CACHE_PERIOD / 1000}s`}
            key={fighter.ticker}
          >
            <div className={classNames('price-info', direction)}>
              <span className="price-ticker">${fighter.ticker}</span>
              <span className="price-value">{`${displayPrice}bp`}</span>
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
  );
};
