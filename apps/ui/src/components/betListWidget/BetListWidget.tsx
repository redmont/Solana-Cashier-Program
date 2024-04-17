import { FC } from 'react';
import { useAppState } from '../AppStateProvider';
import { truncateEthAddress } from '../../utils';

interface BetListWidgetProps {
  compact?: boolean;
}

export const BetListWidget: FC<BetListWidgetProps> = ({ compact }) => {
  const { bets, totalBets } = useAppState();

  return (
    <div className="bet-list-widget">
      <div className="header">
        <div className="column">
          <div className="fighter-name">Doge</div>
          <div className="bet-total">{totalBets['doge']} Points</div>
        </div>

        <div className="column">
          <div className="fighter-name">Pepe</div>
          <div className="bet-total">{totalBets['pepe']} Points</div>
        </div>
      </div>

      {!compact && (
        <div className="viewport">
          <div className="bet-list">
            <div className="column">
              {bets.doge.map(({ amount, placer }) => (
                <div className="row">
                  <span>{truncateEthAddress(placer)}</span>
                  <span>{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="column">
              {bets.pepe.map(({ amount, placer }) => (
                <div className="row">
                  <span>{truncateEthAddress(placer)}</span>
                  <span>{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
