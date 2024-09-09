import { FC } from 'react';
import ChallengeCard from '../challengeCard/ChallengeCard';
import { WidgetCountdown } from '../widgetCountdown';
import { quests } from './data';
import { cn } from '@/lib/utils';

type ChallengeCardProps = {
  endDate: string | undefined;
  className?: string;
};

const ChallengesWidget: FC<ChallengeCardProps> = ({ endDate, className }) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-md border border-border bg-foreground p-4',
        className,
      )}
    >
      <div className="flex justify-between">
        <h2 className="mb-4 text-2xl font-semibold text-white">Challenges</h2>
        <span className="flex items-center gap-2">
          Resets in:
          {endDate !== undefined && (
            <WidgetCountdown targetDateTime={endDate} />
          )}
        </span>
      </div>
      <p>
        Track and conquer your challenges to level up your skills and earn
        rewards.
      </p>
      <div className="flex flex-wrap justify-evenly gap-4">
        {quests.map((item, index) => (
          <ChallengeCard key={index} {...item} variant="small" />
        ))}
      </div>
      <div className="flex flex-wrap gap-4 sm:flex-nowrap">
        <ChallengeCard
          variant="large"
          challengeName="Quest Boss"
          challengeCredit="5000"
          challengeDescription="Complete all daily challenges"
          totalXP={8}
          currentXP={2}
          challengeCompleted={false}
        />
        <ChallengeCard
          variant="large"
          challengeName="Quest Lord"
          challengeCredit="50,000"
          challengeDescription="Complete all daily quests in a week"
          totalXP={7}
          currentXP={2}
          challengeCompleted={false}
        />
      </div>
    </div>
  );
};

export default ChallengesWidget;
