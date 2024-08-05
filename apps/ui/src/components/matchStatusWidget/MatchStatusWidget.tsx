import { FC } from 'react';

import { MatchProgress } from '@/components/matchProgress';

export const MatchStatusWidget: FC = () => {
  return (
    <div className="widget match-status-widget">
      <div className="widget-body">
        <MatchProgress />
      </div>
    </div>
  );
};
