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

interface LeaderboardRecord {
  walletAddress: string;
  balance: string;
}

export default function Leaderboard() {
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);
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

          {records.map(({ walletAddress, balance }) => (
            <div
              key={walletAddress}
              className={classNames('mobile-record', {
                highlighted: address === walletAddress,
              })}
            >
              <div className="mobile-record-body">
                <div className="rank">1</div>
                <div className="player">
                  {truncateEthAddress(walletAddress)}
                </div>
                <div className="points-label">Points:</div>
                <div className="points-value">{balance}</div>
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
                {records.map(({ walletAddress, balance }) => (
                  <div className="table-row" key={walletAddress}>
                    <div className="rank">1</div>
                    <div className="player">
                      {truncateEthAddress(walletAddress)}
                    </div>
                    <div className="wins">45</div>
                    <div className="losses">2</div>
                    <div className="winrate">96%</div>
                    <div className="points">{balance}</div>
                  </div>
                ))}
              </div>
            </ScrollPanel>
          )}
        </div>
      </div>
    </main>
  );
}
