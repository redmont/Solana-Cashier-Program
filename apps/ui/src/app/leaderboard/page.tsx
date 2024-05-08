'use client';

import { FC } from 'react';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import { ScrollPanel } from 'primereact/scrollpanel';

export default function Leaderboard() {
  return (
    <main className="leaderboard-page">
      <div className="leaderboard">
        <div className="header">
          <h1>Leaderboard</h1>

          <div className="search-input-group p-inputgroup">
            <InputText className="search-input" placeholder="Search" />

            <Button icon="pi pi-search" className="p-button-" />
          </div>
        </div>

        <div className="body">
          <MobileRecord highlighted />
          <MobileRecord />
          <MobileRecord />
          <MobileRecord />
          <MobileRecord />
          <MobileRecord />
          <MobileRecord />

          <ScrollPanel className="table">
            <div className="table-header">
              <div className="rank">Rank</div>
              <div className="player">Player</div>
              <div className="wins">Wins</div>
              <div className="losses">Losses</div>
              <div className="winrate">Win Rate</div>
              <div className="points">Points</div>
            </div>

            <div className="table-viewport">
              <div className="table-body">
                <div className="table-row highlighted">
                  <div className="rank">1</div>
                  <div className="player">0xbfj5fZ...dbv3</div>
                  <div className="wins">45</div>
                  <div className="losses">2</div>
                  <div className="winrate">96%</div>
                  <div className="points">3,214,765</div>
                </div>

                <div className="table-row">
                  <div className="rank">1</div>
                  <div className="player">0xbfj5fZ...dbv3</div>
                  <div className="wins">45</div>
                  <div className="losses">2</div>
                  <div className="winrate">96%</div>
                  <div className="points">3,214,765</div>
                </div>

                <div className="table-row">
                  <div className="rank">1</div>
                  <div className="player">0xbfj5fZ...dbv3</div>
                  <div className="wins">45</div>
                  <div className="losses">2</div>
                  <div className="winrate">96%</div>
                  <div className="points">3,214,765</div>
                </div>

                <div className="table-row">
                  <div className="rank">1</div>
                  <div className="player">0xbfj5fZ...dbv3</div>
                  <div className="wins">45</div>
                  <div className="losses">2</div>
                  <div className="winrate">96%</div>
                  <div className="points">3,214,765</div>
                </div>

                <div className="table-row">
                  <div className="rank">1</div>
                  <div className="player">0xbfj5fZ...dbv3</div>
                  <div className="wins">45</div>
                  <div className="losses">2</div>
                  <div className="winrate">96%</div>
                  <div className="points">3,214,765</div>
                </div>

                <div className="table-row">
                  <div className="rank">1</div>
                  <div className="player">0xbfj5fZ...dbv3</div>
                  <div className="wins">45</div>
                  <div className="losses">2</div>
                  <div className="winrate">96%</div>
                  <div className="points">3,214,765</div>
                </div>

                <div className="table-row">
                  <div className="rank">1</div>
                  <div className="player">0xbfj5fZ...dbv3</div>
                  <div className="wins">45</div>
                  <div className="losses">2</div>
                  <div className="winrate">96%</div>
                  <div className="points">3,214,765</div>
                </div>

                <div className="table-row">
                  <div className="rank">1</div>
                  <div className="player">0xbfj5fZ...dbv3</div>
                  <div className="wins">45</div>
                  <div className="losses">2</div>
                  <div className="winrate">96%</div>
                  <div className="points">3,214,765</div>
                </div>

                <div className="table-row">
                  <div className="rank">1</div>
                  <div className="player">0xbfj5fZ...dbv3</div>
                  <div className="wins">45</div>
                  <div className="losses">2</div>
                  <div className="winrate">96%</div>
                  <div className="points">3,214,765</div>
                </div>

                <div className="table-row">
                  <div className="rank">1</div>
                  <div className="player">0xbfj5fZ...dbv3</div>
                  <div className="wins">45</div>
                  <div className="losses">2</div>
                  <div className="winrate">96%</div>
                  <div className="points">3,214,765</div>
                </div>

                <div className="table-row">
                  <div className="rank">1</div>
                  <div className="player">0xbfj5fZ...dbv3</div>
                  <div className="wins">45</div>
                  <div className="losses">2</div>
                  <div className="winrate">96%</div>
                  <div className="points">3,214,765</div>
                </div>

                <div className="table-row">
                  <div className="rank">1</div>
                  <div className="player">0xbfj5fZ...dbv3</div>
                  <div className="wins">45</div>
                  <div className="losses">2</div>
                  <div className="winrate">96%</div>
                  <div className="points">3,214,765</div>
                </div>

                <div className="table-row">
                  <div className="rank">1</div>
                  <div className="player">0xbfj5fZ...dbv3</div>
                  <div className="wins">45</div>
                  <div className="losses">2</div>
                  <div className="winrate">96%</div>
                  <div className="points">3,214,765</div>
                </div>

                <div className="table-row">
                  <div className="rank">1</div>
                  <div className="player">0xbfj5fZ...dbv3</div>
                  <div className="wins">45</div>
                  <div className="losses">2</div>
                  <div className="winrate">96%</div>
                  <div className="points">3,214,765</div>
                </div>
              </div>
            </div>
          </ScrollPanel>
        </div>
      </div>
    </main>
  );
}

interface MobileRecordProps {
  highlighted?: boolean;
}

const MobileRecord: FC<MobileRecordProps> = ({ highlighted }) => {
  return (
    <div
      className={classNames('mobile-record', {
        highlighted,
      })}
    >
      <div className="mobile-record-body">
        <div className="rank">1</div>
        <div className="player">0xbfj5fZ...dbv3</div>
        <div className="points-label">Points:</div>
        <div className="points-value">3,214,765</div>
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
};
