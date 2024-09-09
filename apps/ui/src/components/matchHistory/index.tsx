import { cn } from '@/lib/utils';
import { GetUserMatchHistoryMessageResponse } from '@bltzr-gg/brawlers-ui-gateway-messages';
import { FC } from 'react';

type MatchHistory = GetUserMatchHistoryMessageResponse['matches'];

type MatchHistoryProps = {
  history: MatchHistory;
};

const MatchHistory: FC<MatchHistoryProps> = ({ history }) => {
  return (
    <div className="px-2">
      <div className="mt-2 grid grid-cols-[1fr_2fr_2fr_1fr] px-2 py-3 text-xs">
        <div>Date</div>
        <div>Fighter 1</div>
        <div>Fighter 2</div>
        <div className="flex justify-end">Result</div>
      </div>
      <div className="space-y-2">
        {history?.map(
          ({ startTime, fighters, winner, winAmount, betAmount }, index) => (
            <div
              className="grid grid-cols-[1fr_2fr_2fr_1fr] items-center gap-2 p-2 text-sm"
              key={index}
            >
              <div>{new Date(startTime).toLocaleDateString('en-US')}</div>
              <div className="w-full px-1">
                <div
                  className={cn(
                    'flex w-full items-center justify-between rounded-md bg-[#F0AC5D0A] px-2 py-1',
                    winner.codeName === fighters[0].codeName &&
                      'border border-primary-700 bg-[#4CDC8814]',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <img src={fighters[0].imageUrl} alt="" className="w-7" />
                    <p className="font-bold text-white">
                      {fighters[0].displayName}
                    </p>
                  </div>
                  {winner.codeName === fighters[0].codeName ? betAmount : 0}
                </div>
              </div>

              <div className="w-full px-1">
                <div
                  className={cn(
                    'flex w-full items-center justify-between rounded-md bg-[#F0AC5D0A] px-2 py-1',
                    winner.codeName === fighters[1].codeName &&
                      'border border-primary-700 bg-[#4CDC8814]',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <img src={fighters[1].imageUrl} alt="" className="w-7" />
                    <p className="font-bold text-white">
                      {fighters[1].displayName}
                    </p>
                  </div>
                  {winner.codeName === fighters[1].codeName ? betAmount : 0}
                </div>
              </div>
              <div
                className={cn(
                  'flex justify-end font-bold',
                  winAmount > '0' ? 'text-primary-700' : 'text-red-500',
                )}
              >
                {winAmount > '0' ? '+' + winAmount : '-' + betAmount}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default MatchHistory;
