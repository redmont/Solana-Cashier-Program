'use client';

import { FC, useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface PrizesWidgetProps {
  prizes: {
    title: string;
    description: string;
    imageUrl?: string;
  }[];
}

export const PrizesWidget: FC<PrizesWidgetProps> = ({ prizes }) => {
  const [showPrev, setShowPrev] = useState(false);

  return (
    <div className="widget prizes-widget">
      <div className="widget-header">
        <div className="widget-header-section">
          <div className="widget-title">Tournament Prizes</div>
        </div>

        <p className="flex">
          All players are eligible for the Tournament Prize Raffle (
          <p className="text-primary">&nbsp;1 XP&nbsp;</p>=
          <p className="text-primary">&nbsp;1 entry&nbsp;</p>
          ).
        </p>
      </div>

      <div className="widget-body">
        <div>
          <div className="table-container">
            {prizes.map((prize, index) => (
              <PrizeTile
                key={index}
                place="4"
                imageSrc={prize.imageUrl}
                imageClassName="size-12 rounded-md"
                title={prize.title}
                description={prize?.description}
                className="prize-tile border-2 border-border py-12"
              />
            ))}
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
          className={cn('prev-winner', {
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
  title?: string;
  imageSrc?: string;
  imageClassName?: string;
  size?: 'large' | 'medium' | 'small';
  className?: string;
  externalLink?: boolean;
}

const PrizeTile: FC<PrizeTileProps> = (props) => {
  return (
    <div
      className={cn(`${props.className}`, `prize-${props.place}`, props.size)}
    >
      {props.imageSrc && (
        <div className={cn('prize-icon', `prize-${props.place}`, 'w-20')}>
          {props.title === 'Ordinal Maxi Biz #3564' ? (
            <Link
              href="https://magiceden.io/ordinals/item-details/859841ae9351a9ffc4676ebf2a9479e1867823bb50a7cb0fd2d00188688a517ei0"
              target="_blank"
            >
              <img src={props.imageSrc} className={cn('size-20 rounded-md')} />
            </Link>
          ) : (
            <img src={props.imageSrc} className={cn(props.imageClassName)} />
          )}
        </div>
      )}

      <div className="prize-info flex w-full justify-center">
        <div className="text-left text-white">
          <p className="text-lg font-bold">{props.title}</p>
          {props.description && (
            <p className="text-sm">
              {props.description.split(/(\$\d+k?)/).map((part, index) => (
                <span
                  key={index}
                  className={/^\$\d+k?$/.test(part) ? 'text-primary' : ''}
                >
                  {part}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
