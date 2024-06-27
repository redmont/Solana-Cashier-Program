'use client';

import {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import dayjs from 'dayjs';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import {
  GetTournamentMessage,
  GetTournamentMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { useSocket } from '@/hooks';
import { truncateEthAddress } from '@/utils';
import { Tooltip } from '@/components/Tooltip';

interface RecordProps {
  walletAddress: string;
  balance: string;
  rank: number;
  highlighted?: boolean;
  winAmount?: string;
}

const leaderboardPrizeOrder = ['2', '1', '3'] as const;

export default function Leaderboard() {
  const coundownTimer = useRef<NodeJS.Timeout>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltered, setFiltered] = useState(false);
  const [records, setRecords] = useState<RecordProps[]>([]);
  const [currentRecord, setCurrentRecord] = useState<RecordProps | null>(null);
  const { send, connected } = useSocket();
  const [isReady, setReady] = useState(false);
  const [tournamentName, setTournamentName] = useState('');

  const [prizes, setPrizes] = useState<GetTournamentMessageResponse['prizes']>(
    [],
  );

  const [countdownTarget, setCountdownTarget] = useState<number>(0);
  const [countdownValue, setCountdownValue] = useState<number>(0);

  const getData = useCallback(
    async (query: string) => {
      if (!connected) return;

      const resp = await send(new GetTournamentMessage(100, 1, query));

      const {
        displayName,
        items,
        currentUserItem = null,
        prizes = [],
        endDate,
      } = resp as GetTournamentMessageResponse;

      if (endDate) {
        setCountdownTarget(dayjs(endDate).valueOf());
      }

      setTournamentName(displayName);
      setRecords(items.slice(0, 100));
      setCurrentRecord(currentUserItem);
      setPrizes(prizes);
    },
    [connected, send],
  );

  useEffect(() => {
    let timer = coundownTimer.current;

    if (timer) return;

    timer = coundownTimer.current = setInterval(() => {
      let timeLeft = countdownTarget
        ? dayjs(countdownTarget).diff().valueOf()
        : 0;

      if (timeLeft < 0) timeLeft = 0;

      setCountdownValue(Math.floor(timeLeft / 1000));
    }, 1000);

    return () => {
      timer && clearInterval(timer);
      coundownTimer.current = undefined;
    };
  }, [countdownTarget]);

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

  useEffect(() => setReady(true), []);

  useEffect(() => {
    const el = carouselRef.current;

    if (!el) return;

    const { width } = el.getBoundingClientRect();

    el.scrollLeft = (el.scrollWidth - width) / 2;
  }, []);

  const countdownSeconds = countdownValue % 60;
  const countdownMinutes = Math.floor(countdownValue / 60) % 60;
  const countdownHours = Math.floor(countdownValue / 60 / 60) % 24;
  const countdownDays = Math.floor(countdownValue / 60 / 60 / 24);

  return (
    <main className="leaderboard-page">
      <div className="tournament-info">
        <div className="tournament-name">{tournamentName}</div>

        <Tooltip content={`Time left until the tournament ends`}>
          <div className="tournament-countdown">
            <span>{countdownDays}d</span>
            <span>{countdownHours}h</span>
            <span>{countdownMinutes}m</span>
            <span>{countdownSeconds}s</span>
          </div>
        </Tooltip>
      </div>

      <div
        className={classNames('prize-carousel', { loading: !isReady })}
        ref={carouselRef}
      >
        {leaderboardPrizeOrder.map((place) => (
          <PrizeTile
            large={place === '1'}
            place={place}
            value={prizes[+place - 1]?.title}
            description={prizes[+place - 1]?.description}
          />
        ))}
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
            <div className="table">
              <div className="table-header">
                <Tooltip content="Rank in this tournament">
                  <div className="rank">Rank</div>
                </Tooltip>
                <div className="player">Player</div>
                <Tooltip content="Last recorded credit balance in this tournament">
                  <div className="credits">Credit Balance</div>
                </Tooltip>
                <Tooltip
                  content={`Sum of net earnings from each match played in this tournament`}
                >
                  <div className="wins">Winnings</div>
                </Tooltip>
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
            </div>
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
      <div className="wins-label">Winnings:</div>
      <div className="wins-value">{props.winAmount}</div>
      <div className="credits-label">Credit Balance:</div>
      <div className="credits-value">
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
    <div className="credits">{Math.floor(+props.balance).toLocaleString()}</div>
    <div className="wins">{props.winAmount}</div>
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
