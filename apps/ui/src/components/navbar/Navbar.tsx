import { balanceAtom } from '@/store/account';
import { useAtom, useAtomValue } from 'jotai';
import Link from 'next/link';
import { Dispatch, forwardRef, SetStateAction, useRef, useState } from 'react';
import { JoinButton } from '../JoinButton';
import { useEthWallet } from '@/hooks';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { tutorialCompletedAtom } from '@/store/view';
import InfoIcon from './InfoIcon';
import useOnClickOutside from '@/hooks/useOnClickOutside';
import { CashierForm } from '../cashier';
import { Button } from '../ui/button';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

const Burger = forwardRef<
  HTMLButtonElement,
  {
    isNavOpen: boolean;
    setNavOpen: Dispatch<SetStateAction<boolean>>;
  }
>(({ isNavOpen, setNavOpen }, ref) => (
  <button
    ref={ref}
    className={cn(
      'relative flex h-12 w-12 items-center justify-center transition-all md:hidden',
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

export const Navbar = () => {
  const { isAuthenticated } = useEthWallet();
  const [tutorialCompleted, setTutorialCompleted] = useAtom(
    tutorialCompletedAtom,
  );
  const balance = useAtomValue(balanceAtom);

  const [isNavOpen, setNavOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  useOnClickOutside<HTMLElement>([navRef, burgerRef], () => setNavOpen(false));

  const [isCashierOpen, setCashierOpen] = useState(false);
  const cashierRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(cashierRef, () => setCashierOpen(false));
  const cashierEnabled = useFeatureFlag('enable-cashier');

  const currentPath = usePathname();
  const linkClasses = (active: boolean) =>
    cn(
      'font-bold flex gap-2 items-center cursor-pointer hover:text-primary py-4 px-3 whitespace-nowrap',
      {
        'text-primary': active,
      },
    );
  const linkProps = (path: string) => ({
    className: linkClasses(path === currentPath),
    href: path,
  });

  const NavLinks = () => (
    <>
      <Link {...linkProps('/')}>Play</Link>
      <Link {...linkProps('/tournament')}>Tournament</Link>
      <Link
        {...linkProps('https://forms.gle/5uQjMrR419w4cT5w9')}
        target="_blank"
        rel="noopener noreferrer"
      >
        Add Your Character
      </Link>
    </>
  );

  const HowToPlay = ({ className }: { className?: string }) => (
    <span
      className={cn(linkClasses(tutorialCompleted === 'no'), className)}
      onClick={() => setTutorialCompleted('no')}
    >
      <InfoIcon />
      How To Play
    </span>
  );

  return (
    <div className="h- relative mb-4 mt-3 flex justify-between rounded-xl bg-foreground">
      <div className="flex items-center gap-3">
        <div className="flex shrink-0 items-center justify-center px-4 py-2">
          <Link href="/">
            <img
              className="size-12 shrink-0 md:hidden"
              src="/logo-mobile.png"
              alt="Logo"
            />
            <img className="hidden h-12 md:block" src="/logo.png" alt="Logo" />
          </Link>
        </div>
        <div className="hidden h-full w-16 bg-background clip-path-skewed xs:flex" />
        <div className="hidden gap-4 px-1 md:flex">
          <NavLinks />
        </div>
      </div>
      <div className="flex items-center gap-4 pr-4">
        <HowToPlay className="hidden sm:flex" />
        <div
          className={cn(
            'text-text-100 relative flex items-center gap-3 rounded-lg bg-primary-600/10 py-1.5 pl-3 pr-1.5 font-bold text-white',
            {
              hidden: !isAuthenticated,
            },
          )}
        >
          <span className="inline-flex gap-1">
            <span className="hidden sm:inline">Credits:</span>
            <span>{Math.floor(balance ?? 0)}</span>
          </span>

          {cashierEnabled && (
            <Button
              onClick={() => {
                setCashierOpen((open) => !open);
              }}
            >
              Cashier
            </Button>
          )}
          {isCashierOpen && (
            <div
              ref={cashierRef}
              className="fixed right-0 top-24 z-10 mx-2 w-[calc(100%-1rem)] rounded-md bg-foreground p-5 sm:absolute sm:top-[calc(100%+1rem)] sm:w-96"
            >
              <CashierForm onClose={() => setCashierOpen(false)} />
            </div>
          )}
        </div>
        <JoinButton className="username cursor-pointer md:flex" />
        <Burger ref={burgerRef} isNavOpen={isNavOpen} setNavOpen={setNavOpen} />
      </div>
      {isNavOpen && (
        <div
          ref={navRef}
          className="absolute right-0 top-[calc(100%+1rem)] z-10 w-full rounded-md bg-foreground p-5 shadow-xl md:w-80"
        >
          <div className="top-side flex flex-col items-center text-xl md:items-end">
            <NavLinks />
            <HowToPlay className="mt-6 sm:hidden" />
          </div>
        </div>
      )}
    </div>
  );
};
