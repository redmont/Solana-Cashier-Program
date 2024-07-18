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
          <div className="widget-title">Tournament Prizes</div>

          <WidgetCountdown targetDateTime={endDateTime} />
        </div>

        <p className="widget-info">
          Gain XP for more entries to win major tournament prizes
        </p>
      </div>

      <div className="widget-body">
        <div>
          <div
            className={classNames('prize-carousel', 'layout', { loading: !isReady })}
            ref={carouselRef}
          >
            <PrizeTile
              place="1"
              size="large"
              imageSrc="/1st.svg"
              value={prizes[0]?.title}
              description={prizes[0]?.description}
              className="prize-tile"
            />

            <PrizeTile
              place="2"
              size="medium"
              imageSrc="/2nd.svg"
              value={prizes[1]?.title}
              description={prizes[1]?.description}
              className="prize-tile"
            />

            <PrizeTile
              place="3"
              size="small"
              imageSrc="/3rd.svg"
              value={prizes[2]?.title}
              description={prizes[2]?.description}
              className="prize-tile"
            />
          </div>
          <PrizeTile
            place="4"
            imageSrc="/raffle.svg"
            // value={prizes[3]?.title}
            description={prizes[3]?.description}
            className="prize-tile"
          />
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
        <div className="prize-value">{props.value}</div>
        <div className="prize-description">{props.description}</div>
      </div>
    </div>
  );
};
