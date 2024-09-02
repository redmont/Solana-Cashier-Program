import { FC } from 'react';

export const ZealyWidget: FC = () => {
  return (
    <div className="widget zealy-widget rounded-md">
      <div className="widget-header">
        Earn additional credits via our Zealy campaign
      </div>

      <div className="widget-body">
        <img src="/lfb.png" />
      </div>

      <div className="widget-footer">
        <a
          className="block w-full rounded-lg bg-primary-500 px-5 py-2.5 text-center text-sm font-bold text-black transition-all delay-100 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 focus:ring-offset-black"
          href="https://zealy.io/cw/brawl3rs/questboard"
          target="_blank"
        >
          Go to Zealy
        </a>
      </div>
    </div>
  );
};
