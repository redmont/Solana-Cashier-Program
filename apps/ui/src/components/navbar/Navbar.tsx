import { balanceAtom, usernameAtom, userIdAtom } from '@/store/account';
import { useAtom, useAtomValue } from 'jotai';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { useSocket, useWallet } from '@/hooks';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { tutorialCompletedAtom } from '@/store/view';
import InfoIcon from './InfoIcon';
import useOnClickOutside from '@/hooks/useOnClickOutside';
import { CashierForm } from '../cashier';
import { Button } from '../ui/button';
import { Burger } from './Burger';
import { Wallet2Icon } from 'lucide-react';
import { Plus } from 'lucide-react';
import { formatCompact } from '@/utils';
import { useDynamicAuthClickHandler } from '@/hooks/useDynamicAuthClickHandler';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { calculateRankLeaderboard } from '@/hooks/useRankCal';
import { useQuery } from '@tanstack/react-query';
import {
  GetUserProfileMessage,
  GetUserProfileMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';

export const Navbar = () => {
  const progressionFeature = useFeatureFlag('progression');
  const openDynamicAuth = useDynamicAuthClickHandler();
  const { send, connected } = useSocket();
  const username = useAtomValue(usernameAtom);
  const { isAuthenticated } = useWallet();
  const [tutorialCompleted, setTutorialCompleted] = useAtom(
    tutorialCompletedAtom,
  );

  const userXp = useQuery({
    queryKey: ['userXp'],
    queryFn: () =>
      send<GetUserProfileMessage, GetUserProfileMessageResponse>(
        new GetUserProfileMessage(),
      ),
    enabled: connected,
  });

  const balance = useAtomValue(balanceAtom);
  const { currentRankImage } = calculateRankLeaderboard(userXp.data?.xp ?? 0);
  const userId = useAtomValue(userIdAtom);

  const [isNavOpen, setNavOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  useOnClickOutside<HTMLElement>([navRef, burgerRef], () => setNavOpen(false));

  const [isCashierOpen, setCashierOpen] = useState(false);
  const cashierRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(cashierRef, () => setCashierOpen(false));

  const currentPath = usePathname();
  const linkClasses = (active: boolean) =>
    cn(
      'font-bold flex gap-2 items-center cursor-pointer hover:text-primary py-4 px-2 whitespace-nowrap',
      {
        'text-primary': active,
      },
    );
  const linkProps = (path: string, className = '') => ({
    className: cn(linkClasses(path === currentPath), className),
    href: path,
  });

  const NavLinks = () => (
    <>
      <Link {...linkProps('/')}>Play</Link>
      <Link {...linkProps('/tournament')}>Tournament</Link>
      <Link {...linkProps('/fighters')}>Fighters</Link>
      <Link
        {...linkProps('https://brawl3rs.firstpromoter.com/')}
        target="_blank"
        rel="noopener noreferrer"
      >
        Affiliate
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

  const CashierButton = ({
    className,
    compact = true,
  }: {
    className?: string;
    compact?: boolean;
  }) => (
    <div
      className={cn(
        'text-text-100 relative flex items-center gap-3 rounded-lg bg-primary-600/10 py-1.5 pl-3 pr-1.5 font-bold text-white',
        {
          hidden: !isAuthenticated,
        },
        className,
      )}
    >
      <span className="inline-flex gap-1">
        {balance !== undefined && (
          <>
            <span className={cn(compact && 'hidden sm:inline')}>Balance:</span>
            <span className={cn(!compact && 'hidden')}>
              ${formatCompact(Math.floor(balance / 10000))}
            </span>
            <span className={cn(compact && 'hidden')}>
              {balance.toLocaleString()}
            </span>
          </>
        )}
      </span>

      <Button
        className="sm:!size-fit sm:!px-5 sm:!py-2 xs:size-8 xs:px-1 xs:py-0"
        loading={balance === undefined || userId === undefined}
        onClick={() => {
          setCashierOpen((open) => !open);
        }}
      >
        <span className={cn('inline sm:!inline xs:hidden')}>Deposit</span>
        <span className="hidden sm:!hidden xs:inline">
          <Plus />
        </span>
      </Button>
    </div>
  );

  return (
    <div className="relative mb-4 mt-3 flex justify-between rounded-xl bg-foreground">
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
        <div className="hidden gap-2 px-1 lg:flex">
          <NavLinks />
        </div>
      </div>
      <div className="flex items-center gap-4 pr-4">
        <HowToPlay className="hidden md:flex" />
        {isAuthenticated ? (
          <>
            <CashierButton className="hidden xs:flex" />
            <Button variant={'outline'} onClick={openDynamicAuth}>
              <Wallet2Icon className="size-6" />
            </Button>
            <Button className="hidden px-2 sm:block" variant="outline">
              <span className="sr-only">Profile</span>

              <Link href="/profile">
                {progressionFeature && (
                  <img
                    src={`/progression_system_belts/${currentRankImage}`}
                    alt=""
                    className="mr-2 inline-block size-6"
                  />
                )}
                {username}
              </Link>
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={openDynamicAuth}>
            Join the Fight
          </Button>
        )}
        <Burger
          className="flex lg:hidden"
          ref={burgerRef}
          isNavOpen={isNavOpen}
          setNavOpen={setNavOpen}
        />
      </div>
      {isCashierOpen && (
        <div
          ref={cashierRef}
          className="absolute right-0 top-[calc(100%+1rem)] z-20 mx-0 w-[calc(100vw-1rem)] rounded-md border border-border bg-foreground p-5 shadow-md sm:top-[calc(100%+1rem)] sm:w-[28rem]"
        >
          <CashierForm onClose={() => setCashierOpen(false)} />
        </div>
      )}
      {isNavOpen && (
        <div
          ref={navRef}
          className="absolute right-0 top-[calc(100%+1rem)] z-10 w-full rounded-md bg-foreground p-5 shadow-xl md:w-80"
        >
          <div className="top-side flex flex-col items-center text-xl md:items-end">
            {isAuthenticated && (
              <CashierButton
                compact={false}
                className="mb-4 justify-center xs:hidden"
              />
            )}
            <Link {...linkProps('/profile', 'block sm:hidden')}>Profile</Link>
            <NavLinks />
            <HowToPlay className="mt-6 md:hidden" />
          </div>
        </div>
      )}
    </div>
  );
};
