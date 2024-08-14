import { FC } from 'react';
import { useEthWallet } from '@/hooks';
import { truncateEthAddress } from '../../utils';
import { classNames } from 'primereact/utils';
import { TabView, TabPanel } from 'primereact/tabview';
import { Scrollable } from '@/components/ui/scrollable';
import { CurrentFight } from './CurrentFight';
import { FightFixture } from './FightFixture';
import Typography from '@/components/ui/typography';
import { useAtomValue } from 'jotai';
import { fighterBettingInformationAtom } from '@/store/match';
import { useFightCardData } from './useFightCardData';

export const FightCardWidget: FC = () => {
  const bettingInfos = useAtomValue(fighterBettingInformationAtom);
  const { address } = useEthWallet();
  const { previousFights, roster } = useFightCardData();

  return (
    <div className="widget fight-card-widget">
      <div className="widget-body">
        <div className="widget-body-top">
          <Typography variant="header-secondary" className="left">
            Up Next
          </Typography>

          {roster.length > 0 && <FightFixture fighters={roster[0].fighters} />}

          <CurrentFight />
        </div>

        <Scrollable className="bet-list-viewport">
          <TabView className="tab-view" activeIndex={0}>
            <TabPanel header="Depth" headerClassName="tab-header">
              <div className="bet-list">
                {bettingInfos.map((betInfo, i) => {
                  const list = betInfo?.list;
                  return (
                    <div className="bet-list-column" key={i}>
                      {list?.map(({ amount, walletAddress }, index) => (
                        <div
                          key={index}
                          className={classNames('bet-list-row', {
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

            <TabPanel header="Past Fights" headerClassName="tab-header">
              <div className="fight-history">
                {previousFights.map(({ fighters, winner }, index) => (
                  <FightFixture
                    key={index}
                    fighters={fighters}
                    winner={winner}
                  />
                ))}
              </div>
            </TabPanel>
          </TabView>
        </Scrollable>
      </div>
    </div>
  );
};
