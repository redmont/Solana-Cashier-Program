import { FC } from 'react';

export const ZealyWidget: FC = () => {
  return (
    <div className="widget zealy-widget">
      <div className="widget-header">
        Earn additional credits via our Zealy campaign
      </div>

      <div className="widget-body">
        <img src="/lfb.png" />
      </div>

      <div className="widget-footer">
        <a
          className="goto-button p-button"
          href="https://zealy.io/cw/brawl3rs/questboard"
          target="_blank"
        >
          Go to Zealy
        </a>
      </div>
    </div>
  );
};
