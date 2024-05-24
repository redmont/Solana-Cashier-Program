'use client';

import {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import { ScrollPanel } from 'primereact/scrollpanel';
import { ProgressSpinner } from 'primereact/progressspinner';
import {
  GetTournamentMessage,
  GetTournamentMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { useSocket } from '@/hooks';
import { truncateEthAddress } from '@/utils';

interface RecordProps {
  walletAddress: string;
  balance: string;
  rank: number;
  highlighted?: boolean;
}

export default function Leaderboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltered, setFiltered] = useState(false);
  const [records, setRecords] = useState<RecordProps[]>([]);
  const [currentRecord, setCurrentRecord] = useState<RecordProps | null>(null);
  const { send, connected } = useSocket();
  const [isReady, setReady] = useState(false);

  const getData = useCallback(
    async (query: string) => {
      if (!connected) return;

      const resp = await send(new GetTournamentMessage(100, 1, query));

      const { items, currentUserItem = null } =
        resp as GetTournamentMessageResponse;

      setRecords(items.slice(0, 100));
      setCurrentRecord(currentUserItem);
    },
    [connected, send],
  );

  useEffect(() => {
    getData('');
  }, [getData]);

  const handleSearchQueryChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(evt.target.value);
    },
    [],
  );

  const search = useCallback(async () => {
    await getData(searchQuery);
    setFiltered(true);
  }, [searchQuery, getData]);

  const clearSearch = useCallback(async () => {
    await getData('');
    setFiltered(false);
    setSearchQuery('');
  }, [getData]);

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => setReady(true));

  useEffect(() => {
    const el = carouselRef.current;

    if (!el) return;

    const { width } = el.getBoundingClientRect();

    el.scrollLeft = (el.scrollWidth - width) / 2;
  }, []);

  return (
    <main className="leaderboard-page">
      <div className="tournament-info">
        <div className="tournament-name">Tournament name</div>
        <div className="tournament-countdown">
          <span>5d</span>
          <span>16h</span>
          <span>22m</span>
          <span>12s</span>
        </div>
      </div>

      <div
        className={classNames('prize-carousel', { loading: !isReady })}
        ref={carouselRef}
      >
        <PrizeTile
          place="2"
          value="$100"
          description="$100 in USDC will be deposited into the winner's wallet."
        />

        <PrizeTile
          large
          place="1"
          value="$150"
          description="$150 in USDC will be deposited into the winner's wallet."
        />

        <PrizeTile
          place="3"
          value="$50"
          description="$50 in USDC will be deposited into the winner's wallet."
        />
      </div>

      <div className="leaderboard">
        <div className="header">
          <h1>Leaderboard</h1>

          <div className="search-input-group p-inputgroup">
            <InputText
              className="search-input"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchQueryChange}
            />

            <Button icon="pi pi-search" onClick={search} />

            {isFiltered && <Button icon="pi pi-times" onClick={clearSearch} />}
          </div>
        </div>

        <div className="body">
          {records.length === 0 && (
            <div className="empty-state">No records yet</div>
          )}

          {currentRecord && <MobileRecord {...currentRecord} highlighted />}

          {records.map(({ walletAddress, ...props }) => (
            <MobileRecord
              {...props}
              key={walletAddress}
              walletAddress={walletAddress}
            />
          ))}

          {records.length > 0 && (
            <ScrollPanel className="table">
              <div className="table-header">
                <div className="rank">Rank</div>
                <div className="player">Player</div>
                <div className="points">Points</div>
                <div className="wins">Wins</div>
              </div>

              <div className="table-body">
                {currentRecord && <TableRow {...currentRecord} highlighted />}

                {records.map(({ walletAddress, ...props }) => (
                  <TableRow
                    {...props}
                    key={walletAddress}
                    walletAddress={walletAddress}
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
      <div className={`rank rank-${props.rank}`}>{props.rank}</div>
      <div className={`rank-image rank-image-${props.rank}`}></div>
      <div className="player">{truncateEthAddress(props.walletAddress)}</div>
      <div className="wins-label">Points Wins:</div>
      <div className="wins-value">{Math.floor(5000).toLocaleString()}</div>
      <div className="points-label">Points Balance:</div>
      <div className="points-value">
        {Math.floor(+props.balance).toLocaleString()}
      </div>
    </div>
  </div>
);

const TableRow: FC<RecordProps> = (props) => (
  <div
    className={classNames('table-row', { highlighted: props.highlighted })}
    key={props.walletAddress}
  >
    <div className={`rank rank-${props.rank}`}>
      <span className={`rank-image rank-image-${props.rank}`}></span>
      <span className="rank-value">{props.rank}</span>
    </div>
    <div className="player">{truncateEthAddress(props.walletAddress)}</div>
    <div className="points">{Math.floor(+props.balance).toLocaleString()}</div>
    <div className="wins">{Math.floor(5000).toLocaleString()}</div>
  </div>
);

interface PrizeTileProps {
  place: '1' | '2' | '3';
  value?: string;
  description?: string;
  large?: boolean;
}

const PrizeTile: FC<PrizeTileProps> = (props) => {
  return (
    <div
      className={classNames('prize-tile', `prize-${props.place}`, {
        large: props.large,
      })}
    >
      <div className="prize-icon">
        <img src={`/prize-${props.place}.svg`} />
      </div>
      <div className="prize-value">{props.value}</div>
      <div className="prize-description">{props.description}</div>
    </div>
  );
};
