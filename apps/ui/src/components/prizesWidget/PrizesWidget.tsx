'use client';

import { FC, useState, useRef, useEffect } from 'react';
import { classNames } from 'primereact/utils';
import { WidgetCountdown } from '@/components/widgetCountdown';

const prizes: {
  title: string;
  description: string;
}[] = [
  {
    title: 'NFT name',
    description: 'Raffled to the top 20,000 XP Players',
  },
  {
    title: 'NFT name',
    description: 'Raffled to the top 20,000 XP Players',
  },
  {
    title: 'NFT name',
    description: 'Raffled to the top 20,000 XP Players',
  },
];

export interface PrizesWidgetProps {
  title: string;
  prizes: {
    title: string;
    description: string;
  }[];
  endDateTime: string | number;
}

export const PrizesWidget: FC<PrizesWidgetProps> = ({
  title,
  endDateTime,
  prizes,
}) => {
  const [isReady, setReady] = useState(false);
  const [showPrev, setShowPrev] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => setReady(true));

  return (
    <div className="widget prizes-widget">
      <div className="widget-header">
        <div className="widget-header-section">
          <div className="widget-title">Tournament Prizes</div>

          <div className="widget-header-right">
            <div>Tournament ends:</div>
            <WidgetCountdown targetDateTime={endDateTime} />
          </div>
        </div>

        <p className="widget-info">
          Top 3 by XP win main prizes. All players enter raffle (1 XP = 1
          entry). XP resets each tournament.
        </p>
      </div>

      <div className="widget-body">
        <div>
          <div className="table-container">
            <div className="table-section">
              {prizes.slice(0, 10).map((item, index) => (
                <div className="table" key={index}>
                  <div className="cell">{item.title}</div>
                  <div className="cell">{item.description}</div>
                </div>
              ))}
            </div>
            <PrizeTile
              place="4"
              imageSrc="/raffle.svg"
              description={prizes[prizes.length - 1]?.description}
              className="prize-tile"
            />
          </div>
        </div>

        {false && (
            <p className="top-header" onClick={() => setShowPrev(!showPrev)}>
              Hide Previous winners
              <img src="/arrow-down.svg" alt="" />
            </p>
          ) && (
            <p className="top-header" onClick={() => setShowPrev(!showPrev)}>
              Show Previous winners
              <img src="/arrow-right.svg" alt="" />
            </p>
          )}
        <div
          className={classNames('prev-winner', {
            collapsed: !showPrev,
          })}
        >
          <div className="prev-winner-section">
            <div className="prev-winner-card">
              <div className="left">
                <img src="/prizes/1st.svg" alt="" />
                <p>Username</p>
                <div className="middle-left">
                  <span className="username">username</span>
                  <span className="left-xp">2890 XP</span>
                </div>
              </div>
              <div className="middle">
                <p className="mobile-xp">2890 XP</p>
              </div>
              <div className="weighted-font">$2,500 USDC</div>
            </div>

            <div className="prev-winner-card">
              <div className="left">
                <img src="/prizes/2nd.svg" alt="" />
                <p>Username</p>
                <div className="middle-left">
                  <span className="username">username</span>
                  <span className="left-xp">2890 XP</span>
                </div>
              </div>
              <div className="middle">
                <p className="mobile-xp">2890 XP</p>
              </div>
              <div className="weighted-font">$1,000 USDC</div>
            </div>

            <div className="prev-winner-card">
              <div className="left">
                <img src="/prizes/3rd.svg" alt="" />
                <p>Username</p>
                <div className="middle-left">
                  <span className="username">username</span>
                  <span className="left-xp">2890 XP</span>
                </div>
              </div>
              <div className="middle">
                <p className="mobile-xp">2890 XP</p>
              </div>
              <div className="weighted-font">$500 USDC</div>
            </div>

            <div className="prev-winner-card">
              <div className="left">
                <img src="/prizes/raffle.svg" alt="" />
                <p>20 winners</p>
                <div className="middle-left">
                  <span className="username">20 winners</span>
                  <span className="view-all">view all</span>
                </div>
              </div>
              <div className="middle">
                <p className="view-all-mobile">view all</p>
              </div>
              <div className="weighted-font">$1,000 USDC</div>
            </div>
          </div>

          <div className="prize-pool-panel">
            <p className="text">Total Prize Pools</p>
            <div className="prize-pool">
              <span className="top">
                <p className="amount">$5,000</p>
                <p>USDC</p>
              </span>
              <p>Totally distributed during all of the tournaments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PrizeTileProps {
  place: '1' | '2' | '3' | '4';
  value?: string;
  description?: string;
  imageSrc?: string;
  size?: 'large' | 'medium' | 'small';
  className?: string;
}

const PrizeTile: FC<PrizeTileProps> = (props) => {
  return (
    <div
      className={classNames(
        `${props.className}`,
        `prize-${props.place}`,
        props.size,
      )}
    >
      {props.imageSrc && (
        <div className={classNames('prize-icon', `prize-${props.place}`)}>
          <img src={props.imageSrc} />
        </div>
      )}

      <div className="prize-info">
        {props.value && <div className="prize-value">{props.value}</div>}
        <div className="prize-description">{props.description}</div>
      </div>
    </div>
  );
};
