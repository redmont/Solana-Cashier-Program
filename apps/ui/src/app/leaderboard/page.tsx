'use client';

import { FC, useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import { ScrollPanel } from 'primereact/scrollpanel';
import {
  GetLeaderboardMessage,
  GetLeaderboardMessageResponse,
} from 'ui-gateway-messages';
import { useEthWallet, useSocket } from '@/hooks';
import { truncateEthAddress } from '@/utils';

interface RecordProps {
  walletAddress: string;
  balance: string;
  rank: number;
  highlighted?: boolean;
}

export default function Leaderboard() {
  const [records, setRecords] = useState<RecordProps[]>([]);
  const { send, connected } = useSocket();
  const { address } = useEthWallet();

  useEffect(() => {
    if (!connected) return;

    send(new GetLeaderboardMessage()).then((resp) => {
      const { items } = resp as GetLeaderboardMessageResponse;

      setRecords(items.slice(0, 100));
    });
  }, [connected, send]);

  return (
    <main className="leaderboard-page">
      <div className="leaderboard">
        <div className="header">
          <h1>Leaderboard</h1>

          <div className="search-input-group p-inputgroup">
            <InputText className="search-input" placeholder="Search" />

            <Button icon="pi pi-search" />
          </div>
        </div>

        <div className="body">
          {records.length === 0 && (
            <div className="empty-state">No records yet</div>
          )}

          {records.map(({ walletAddress, ...props }) => (
            <MobileRecord
              {...props}
              key={walletAddress}
              walletAddress={walletAddress}
              highlighted={walletAddress === address}
            />
          ))}

          {records.length > 0 && (
            <ScrollPanel className="table">
              <div className="table-header">
                <div className="rank">Rank</div>
                <div className="player">Player</div>
                <div className="wins">Wins</div>
                <div className="losses">Losses</div>
                <div className="winrate">Win Rate</div>
                <div className="points">Points</div>
              </div>

              <div className="table-body">
                {records.map(({ walletAddress, ...props }) => (
                  <TableRow
                    {...props}
                    key={walletAddress}
                    walletAddress={walletAddress}
                    highlighted={walletAddress === address}
                  />
                ))}
              </div>
            </ScrollPanel>
          )}
        </div>
      </div>
    </main>
  );
}

const MobileRecord: FC<RecordProps> = (props) => (
  <div
    className={classNames('mobile-record', {
      highlighted: props.highlighted,
    })}
  >
    <div className="mobile-record-body">
      <div className="rank">{props.rank}</div>
      <div className="player">{truncateEthAddress(props.walletAddress)}</div>
      <div className="points-label">Points:</div>
      <div className="points-value">{props.balance}</div>
      <div className="winrate-label">Winrate:</div>
      <div className="winrate-value">96%</div>
    </div>

    <div className="mobile-record-footer">
      <div className="stat wins">
        <span className="stat-label">Wins:</span>
        <span className="stat-value">45</span>
      </div>

      <div className="stat losses">
        <span className="stat-label">Losses:</span>
        <span className="stat-value">2</span>
      </div>
    </div>
  </div>
);

const TableRow: FC<RecordProps> = (props) => (
  <div
    className={classNames('table-row', { highlighted: props.highlighted })}
    key={props.walletAddress}
  >
    <div className="rank">{props.rank}</div>
    <div className="player">{truncateEthAddress(props.walletAddress)}</div>
    <div className="wins">45</div>
    <div className="losses">2</div>
    <div className="winrate">96%</div>
    <div className="points">{props.balance}</div>
  </div>
);
