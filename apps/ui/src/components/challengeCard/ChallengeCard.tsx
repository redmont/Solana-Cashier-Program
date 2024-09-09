import { cn } from '@/lib/utils';

interface ChallengeCardProp {
  challengeName: string;
  challengeCredit: string;
  challengeDescription?: string;
  variant: 'small' | 'large';
  currentXP?: number;
  totalXP?: number;
  challengeCompleted?: boolean;
  className?: string;
}
export default function ChallengeCard({ ...props }: ChallengeCardProp) {
  return (
    <>
      {props.variant === 'small' ? (
        <div
          className={cn(
            'relative mt-3 flex min-w-36 flex-col items-center justify-center gap-1 rounded-lg border border-border bg-[#0C0C0E] p-2 pt-3',
            props.className,
          )}
        >
          <div
            className={cn(
              'absolute -top-4 hidden rounded-full border border-[#4CDC8829] bg-[#182E28] px-2 py-1 font-bold text-white',
              props.challengeCompleted && 'flex',
            )}
          >
            <img src="/tick.svg" alt="" />
            <p className="text-sm">+</p>
            <p className="text-sm">{props.challengeCredit}</p>
          </div>
          <img src={'/quest/' + props.challengeName + '.svg'} alt="" />
          <p className="text-sm text-white">{props.challengeName}</p>
          <span className="flex items-end text-[#F0AC5D]">
            <p className="text-lg">+</p>
            <p className="text-xl">{props.challengeCredit}</p>
          </span>
          <p>{props.challengeDescription}</p>
          {props.totalXP && props.currentXP && (
            <div className="flex w-full flex-col items-center space-y-1">
              <p className="text-xs">
                {props.totalXP - props.currentXP} XP left to earn
              </p>
              <div className="grid h-1 w-full grid-cols-5 gap-[2px] rounded-full">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-full',
                      (props.currentXP ?? 0) >= (index + 1) * 10000
                        ? 'bg-[#F0AC5D]'
                        : 'bg-[#3E3E3E]',
                      index === 0 && 'rounded-l-full',
                      index === 4 && 'rounded-r-full',
                    )}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'relative mt-3 flex min-w-36 items-center gap-3 rounded-lg border border-[#F0AC5D52] bg-[#0C0C0E] p-3',
            props.className,
          )}
        >
          <div className="flex flex-col items-center justify-center">
            <img src={'/quest/' + props.challengeName + '.svg'} alt="" />
            <p className="text-nowrap text-sm text-white">
              {props.challengeName}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="flex items-end gap-1 text-[#F0AC5D]">
              <p className="text-xl">{'+' + props.challengeCredit}</p>
              <p>credits</p>
            </span>

            <span className="flex gap-4">
              <p className="text-xs">{props.challengeDescription}</p>
              <p className="text-xs">
                {props.currentXP}/{props.totalXP} completed
              </p>
            </span>

            <div className="flex w-full flex-col items-center space-y-1">
              <div
                className={cn(
                  'grid h-1 w-full gap-[2px] rounded-full',
                  `grid-cols-${props.totalXP}`,
                )}
              >
                {Array.from({ length: props.totalXP as number }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className={cn(
                        'h-full',
                        (props.currentXP ?? 0) >= index + 1
                          ? 'bg-[#F0AC5D]'
                          : 'bg-[#3E3E3E]',
                        index === 0 && 'rounded-l-full',
                        index ===
                          (props.totalXP ? (props.totalXP as number) - 1 : 0) &&
                          'rounded-r-full',
                      )}
                    ></div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
