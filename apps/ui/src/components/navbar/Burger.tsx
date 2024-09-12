import { Dispatch, forwardRef, SetStateAction } from 'react';
import { cn } from '@/lib/utils';

export const Burger = forwardRef<
  HTMLButtonElement,
  {
    isNavOpen: boolean;
    setNavOpen: Dispatch<SetStateAction<boolean>>;
    className?: string;
  }
>(({ isNavOpen, setNavOpen, className }, ref) => (
  <button
    ref={ref}
    className={cn(
      'relative flex size-12 items-center justify-center transition-all',
      className,
    )}
    id="icon"
    onClick={() => setNavOpen((open) => !open)}
  >
    <span
      className={cn(
        'absolute h-[3px] w-8 bg-current transition-all duration-300 ease-in-out',
        {
          'translate-y-0 rotate-45': isNavOpen,
          '-translate-y-2 rotate-0': !isNavOpen,
        },
      )}
    ></span>
    <span
      className={cn(
        'absolute h-[3px] w-8 bg-current transition-all duration-300 ease-in-out',
        {
          'opacity-0': isNavOpen,
          'opacity-100': !isNavOpen,
        },
      )}
    ></span>
    <span
      className={cn(
        'absolute h-[3px] w-8 bg-current transition-all duration-300 ease-in-out',
        {
          'translate-y-0 -rotate-45': isNavOpen,
          'translate-y-2 rotate-0': !isNavOpen,
        },
      )}
    ></span>
  </button>
));
