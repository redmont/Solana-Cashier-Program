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
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => setReady(true));

  return (
    <div className="widget prizes-widget">
      <div className="widget-header">
        <div className="widget-header-section">
          <div className="widget-title">{title} Prizes</div>

          <WidgetCountdown targetDateTime={endDateTime} />
        </div>

        <p className="widget-info">
          Gain XP for more entries to win major tournament prizes
        </p>
      </div>

      <div className="widget-body">
        <div
          className={classNames('prize-carousel', { loading: !isReady })}
          ref={carouselRef}
        >
          <PrizeTile
            place="1"
            size="large"
            imageSrc="/main-prize.png"
            value={prizes[0]?.title}
            description={prizes[0]?.description}
          />

          <PrizeTile
            place="2"
            size="medium"
            value={prizes[1]?.title}
            description={prizes[1]?.description}
          />

          <PrizeTile
            place="3"
            value={prizes[2]?.title}
            description={prizes[2]?.description}
          />
        </div>
      </div>
    </div>
  );
};

interface PrizeTileProps {
  place: '1' | '2' | '3';
  value?: string;
  description?: string;
  imageSrc?: string;
  size?: 'large' | 'medium';
}

const PrizeTile: FC<PrizeTileProps> = (props) => {
  return (
    <div
      className={classNames('prize-tile', `prize-${props.place}`, props.size)}
    >
      {props.imageSrc && (
        <div className="prize-icon">
          <img src={props.imageSrc} />
        </div>
      )}

      <div className="prize-info">
        <div className="prize-value">{props.value}</div>
        <div className="prize-description">{props.description}</div>
      </div>
    </div>
  );
};
