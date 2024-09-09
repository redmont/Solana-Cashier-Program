import { FC } from 'react';
import DonutChart from '../ui/donut-chart';
import { useAtomValue } from 'jotai';
import { accountAddressAtom, usernameAtom } from '@/store/account';
import useCopyToClipboard from '@/hooks/useCopyToClipboard';
import { cn } from '@/lib/utils';
import { CircleHelp, Copy } from 'lucide-react';
import { formatCompact } from '@/utils';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

type ProfileWidgetProps = {
  className?: string;
  playedGames: number;
  progress: number;
  totalAmountWon: number;
};

const shorten = (address: string, size = 6) =>
  address.slice(0, size) + '...' + address.slice(-size);

const ProfileWidget: FC<ProfileWidgetProps> = ({
  className,
  playedGames,
  totalAmountWon,
  progress,
}) => {
  const { copyToClipboard } = useCopyToClipboard();
  const username = useAtomValue(usernameAtom);
  const address = useAtomValue(accountAddressAtom);
  const progressionFeature = useFeatureFlag('progression');

  return (
    <div
      className={cn(
        'flex flex-col gap-5 rounded-md border border-border bg-foreground p-4',
        className,
      )}
    >
      <div className="flex grow flex-col items-center gap-5 sm:flex-row sm:justify-start">
        {progressionFeature && (
          <DonutChart
            size={220}
            progress={progress}
            progressClassName="text-gold"
            textProp="Gold Brawler"
          />
        )}
        <div className="flex grow flex-col items-center justify-center gap-5 self-stretch sm:items-start">
          <div>
            <p className="text-2xl font-semibold">{username}</p>
            <p>
              <button onClick={() => copyToClipboard(address ?? '')}>
                <span>{address && shorten(address, 6)}</span>{' '}
                <Copy className="inline size-4" />
              </button>
            </p>
          </div>
          {progressionFeature && (
            <div className="flex flex-col items-center justify-center sm:items-start">
              <button className="flex items-center gap-2 text-xl text-gold">
                <span className="font-semibold leading-none">
                  23,000 / 53,000 XP
                </span>
                <CircleHelp className="inline size-6" />
              </button>
              <p>To Platinum Brawler</p>
            </div>
          )}

          <div className="flex w-full flex-col gap-2 self-stretch text-white md:flex-row lg:flex-col">
            <div className="flex items-center justify-center gap-3 overflow-hidden rounded-md border border-[#4CDC8829] bg-[#4CDC880A] px-6 py-2">
              <span className="text-4xl font-bold">
                {formatCompact(totalAmountWon)}
              </span>
              <span className="leading-tight">Credits Won</span>
            </div>
            <div className="flex items-center justify-center gap-3 self-stretch rounded-md border border-[#4CDC8829] bg-[#4CDC880A] px-6 py-2">
              <p className="text-4xl font-semibold">
                {formatCompact(playedGames)}
              </p>
              <p>Played Games</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileWidget;
