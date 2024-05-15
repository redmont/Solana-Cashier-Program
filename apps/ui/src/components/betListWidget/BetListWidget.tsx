import { FC } from 'react';
import { useAppState } from '@/hooks';
import { truncateEthAddress } from '../../utils';

export const BetListWidget: FC = () => {
  const { match } = useAppState();
  const { fighters = [] } = match ?? {};

  const bets = fighters.map((f, index) => {
    return match?.bets[fighters[index]?.codeName];
  });

  return (
    <div className="widget bet-list-widget">
      <div className="widget-body">
        <div className="header">
          <div className="column">
            <div className="fighter-name">{fighters[0]?.displayName}</div>
            <div className="bet-total">{bets[0]?.total || 0} Points</div>
          </div>

          <div className="column">
            <div className="fighter-name">{fighters[1]?.displayName}</div>
            <div className="bet-total">{bets[1]?.total || 0} Points</div>
          </div>
        </div>

        <div className="viewport">
          <div className="bet-list">
            <div className="column">
              {bets[0]?.list.map(({ amount, walletAddress }, index) => (
                <div key={index} className="row">
                  <span>{truncateEthAddress(walletAddress)}</span>
                  <span>{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="column">
              {bets[1]?.list.map(({ amount, walletAddress }, index) => (
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
