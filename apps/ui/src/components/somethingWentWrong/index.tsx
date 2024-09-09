import { cn } from '@/lib/utils';
import pepeDed from '@/assets/images/pepe-ded.png';

interface SomethingWentWrongProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SomethingWentWrong = ({
  className,
  size = 'md',
}: SomethingWentWrongProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-3 py-5',
        className,
      )}
    >
      <img
        src={pepeDed.src}
        alt="Pepe Ded"
        className={cn({
          'size-24': size === 'sm',
          'size-32': size === 'md',
          'size-48': size === 'lg',
          'size-64': size === 'xl',
        })}
      />
      <h2
        className={cn('text-center font-bold', {
          'text-lg': size === 'sm',
          'text-xl': size === 'md',
          'text-2xl': size === 'lg',
          'text-3xl': size === 'xl',
        })}
      >
        Something went wrong
      </h2>
    </div>
  );
};

export default SomethingWentWrong;
