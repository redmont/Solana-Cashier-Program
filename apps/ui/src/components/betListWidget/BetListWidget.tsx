import { FC } from 'react';
import { useAppState, useEthWallet } from '@/hooks';
import { truncateEthAddress } from '../../utils';
import { classNames } from 'primereact/utils';
import { Scrollable } from '@/components/Scrollable';
import { Tooltip } from '../Tooltip';

export const BetListWidget: FC = () => {
  const { match } = useAppState();
  const { fighters = [] } = match ?? {};
  const { address } = useEthWallet();

  const bets = fighters.map((f, index) => {
    return match?.bets[fighters[index]?.codeName];
  });

  return (
    <div className="widget bet-list-widget">
      <div className="widget-body">
        <div className="header">
          {fighters.map((fighter, i) => (
            <div className="column" key={fighter.codeName}>
              <div className="fighter-name">{fighter.displayName}</div>
              <Tooltip
                content={`Total global stakes in ${fighter.displayName}'s pool`}
              >
                <div className="bet-total">{bets[i]?.total || 0} Credits</div>
              </Tooltip>
            </div>
          ))}
        </div>

        <Scrollable className="bet-list-viewport">
          <div className="bet-list">
            {bets.map((bet, i) => {
              const list = bet?.list;
              return (
                <div className="column" key={i}>
                  {list?.map(({ amount, walletAddress }, index) => (
                    <div
                      key={index}
                      className={classNames('row', {
                        highlighted: walletAddress === address,
                      })}
                    >
                      <span>{truncateEthAddress(walletAddress)}</span>
                      <span>{amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Scrollable>
      </div>
    </div>
  );
};
