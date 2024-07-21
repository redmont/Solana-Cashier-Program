import { FC } from 'react';
import { useAppState, useEthWallet } from '@/hooks';
import { truncateEthAddress } from '../../utils';
import { classNames } from 'primereact/utils';
import { TabView, TabPanel } from 'primereact/tabview';
import { Scrollable } from '@/components/Scrollable';
import { FightFixtures } from '@/components/betListWidget/fightFixtures';
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
        <Scrollable className="bet-list-viewport">
          <TabView className="tab-view" activeIndex={0}>
            <TabPanel header="Depth">
              <div className="header">
                {fighters.map((fighter, i) => (
                  <div className="column" key={fighter.codeName}>
                    <div className="fighter-name">{fighter.displayName}</div>
                    <Tooltip
                      content={`Total global stakes in ${fighter.displayName}'s pool`}
                    >
                      <div className="bet-total">
                        {bets[i]?.total || 0} Credits
                      </div>
                    </Tooltip>
                  </div>
                ))}
              </div>
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
            </TabPanel>
            <TabPanel header="Fight card">
              <FightFixtures />
            </TabPanel>
          </TabView>
        </Scrollable>
      </div>
    </div>
  );
};
