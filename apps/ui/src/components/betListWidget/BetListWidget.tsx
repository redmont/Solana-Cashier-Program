import { FC, useCallback, useEffect, useState } from 'react';
import { useEthWallet, useSocket } from '@/hooks';
import { truncateEthAddress } from '../../utils';
import { classNames } from 'primereact/utils';
import { TabView, TabPanel } from 'primereact/tabview';
import { Scrollable } from '@/components/Scrollable';
import { FightFixtures } from '@/components/betListWidget/fightFixtures';
import { CurrentFight } from './fightFixtures/CurrentFight';
import { FightFixturesList } from './fightFixtures/FightFixturesList';
import {
  GetRosterMessage,
  GetRosterMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { useAtomValue } from 'jotai';
import { fighterBettingInformationAtom } from '@/store/match';

interface RosterItem {
  series: string;
}

export const BetListWidget: FC = () => {
  const bettingInfos = useAtomValue(fighterBettingInformationAtom);
  const { address } = useEthWallet();
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const { send, connected } = useSocket();

  const getRosterData = useCallback(async () => {
    if (!connected) return;

    const resp = (await send(
      new GetRosterMessage(),
    )) as GetRosterMessageResponse;

    const { success, roster } = resp;

    if (success) {
      setRoster(roster);
    }
  }, [connected, send]);

  useEffect(() => {
    if (connected) {
      getRosterData();
    }
  }, [connected, getRosterData]);

  return (
    <div className="widget bet-list-widget">
      <div className="widget-body">
        <div className="fight-fixtures-widget">
          <FightFixturesList
            data={roster}
            title="Up Next"
            success={false}
            matches={[]}
            show={'first'}
          />
          <CurrentFight />
        </div>
        <Scrollable className="bet-list-viewport">
          <TabView className="tab-view" activeIndex={0}>
            <TabPanel header="Depth" headerClassName="tab-header">
              <div className="bet-list">
                {bettingInfos.map((betInfo, i) => {
                  const list = betInfo?.list;
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
            <TabPanel header="Past Fights" headerClassName="tab-header">
              <FightFixtures />
            </TabPanel>
          </TabView>
        </Scrollable>
      </div>
    </div>
  );
};
