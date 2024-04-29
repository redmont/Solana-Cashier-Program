import { FC } from 'react';
import { useAppState } from '../appStateProvider/AppStateProvider';
import { truncateEthAddress } from '../../utils';

export const BetListWidget: FC = () => {
  const { match } = useAppState();
  const { doge, pepe } = match?.bets || {};

  return (
    <div className="widget bet-list-widget">
      <div className="widget-body">
        <div className="header">
          <div className="column">
            <div className="fighter-name">Doge</div>
            <div className="bet-total">{doge?.total || 0} Points</div>
          </div>

          <div className="column">
            <div className="fighter-name">Pepe</div>
            <div className="bet-total">{pepe?.total || 0} Points</div>
          </div>
        </div>

        <div className="viewport">
          <div className="bet-list">
            <div className="column">
              {doge?.list.map(({ amount, walletAddress }, index) => (
                <div key={index} className="row">
                  <span>{truncateEthAddress(walletAddress)}</span>
                  <span>{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="column">
              {pepe?.list.map(({ amount, walletAddress }, index) => (
                <div key={index} className="row">
                  <span>{truncateEthAddress(walletAddress)}</span>
                  <span>{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
