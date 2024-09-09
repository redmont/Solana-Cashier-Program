'use client';

import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import { classNames } from 'primereact/utils';
import { useCountdown, useWallet, usePostHog, useSocket } from '@/hooks';
import {
  GetDailyClaimsMessage,
  GetDailyClaimsMessageResponse,
  ClaimDailyClaimMessage,
  ClaimDailyClaimMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { cn } from '@/lib/utils';

export const CreditClaimWidget: FC<{ className?: string }> = ({
  className,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, allowScrollLeft] = useState(false);
  const [canScrollRight, allowScrollRight] = useState(false);
  const { send, connected } = useSocket();
  const posthog = usePostHog();
  const [isClaiming, setClaiming] = useState(false);
  const [claims, setClaims] = useState<GetDailyClaimsMessageResponse | null>(
    null,
  );

  const nextClaimCountdown = useCountdown(claims?.nextClaimDate ?? 0);
  const claimExpiryCountdown = useCountdown(claims?.claimExpiryDate ?? 0);

  // Reset streak if it is expired
  const streak = useMemo(
    () => (claims?.streak && claimExpiryCountdown > 0 ? claims.streak : 0),
    [claims?.streak, claimExpiryCountdown],
  );

  useEffect(() => {
    if (!connected) {
      return;
    }

    send(new GetDailyClaimsMessage()).then((message: unknown) => {
      setClaims(message as GetDailyClaimsMessageResponse);
    });
  }, [send, connected]);

  const align = useCallback(() => {
    const viewportEl = viewportRef.current;

    const currentCard = viewportEl?.querySelector('.credit-claim-card.current');

    if (!viewportEl || !currentCard) {
      return;
    }

    const { x: viewportX = 0, width: viewportW = 0 } =
      viewportEl?.getBoundingClientRect() ?? {};

    const { x: cardX, width: cardW } = currentCard.getBoundingClientRect();

    const scrollLeft =
      cardX + cardW / 2 + viewportEl.scrollLeft - viewportX - viewportW / 2;

    // Has to be dalayed due to internal logic of Scrollable
    setTimeout(() => {
      viewportEl.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => {
    align();
  }, [claims?.streak, align]);

  const scroll = useCallback((direction: 1 | -1) => {
    const viewportEl = viewportRef.current;

    if (!viewportEl) {
      return;
    }

    const shift = viewportEl.clientWidth * 0.25;

    viewportRef.current?.scrollTo({
      left: viewportEl.scrollLeft + shift * direction,
      behavior: 'smooth',
    });
  }, []);

  const claim = useCallback(async () => {
    if (!claims) {
      return;
    }

    const { dailyClaimAmounts } = claims;
    setClaiming(true);

    try {
      const { success, data } = await send<
        ClaimDailyClaimMessage,
        ClaimDailyClaimMessageResponse
      >(new ClaimDailyClaimMessage(dailyClaimAmounts[streak]));

      if (!success) {
        return;
      }

      posthog?.capture('Daily Credits Claimed', {
        streak: streak + 1,
        amount: dailyClaimAmounts[streak],
      });

      setClaims({
        ...claims,
        ...(data ?? {}),
      });
    } finally {
      setClaiming(false);
    }
  }, [claims, send, streak, posthog]);

  const checkScroll = useCallback(() => {
    const viewportEl = viewportRef.current;

    if (!viewportEl) {
      return;
    }

    allowScrollLeft(viewportEl.scrollLeft !== 0);

    const { width: viewportW = 0 } = viewportEl?.getBoundingClientRect() ?? {};

    allowScrollRight(
      viewportEl.scrollLeft + viewportW !== viewportEl.scrollWidth,
    );
  }, []);

  useEffect(() => checkScroll(), [checkScroll]);

  return (
    <div
      className={cn(
        'widget credit-claim-widget w-full rounded-md bg-foreground',
        className,
      )}
    >
      <div className="widget-header">
        <h2 className="mb-4 text-2xl font-semibold text-white">
          Daily Credits Claim
        </h2>
        <p>
          Boost your rewards daily! Claim credits to grow your streak - miss a
          day, and it resets.
        </p>
      </div>
      <div className="widget-body">
        <div
          ref={viewportRef}
          className="credit-claims-viewport justify-evenly"
          onScroll={checkScroll}
        >
          {claims?.dailyClaimAmounts.map((amount, i) => (
            <CreditClaimCard
              key={i}
              day={i + 1}
              amount={amount}
              claiming={isClaiming}
              claimed={i < streak}
              current={i === streak}
              expiryMs={claimExpiryCountdown}
              availableInMs={nextClaimCountdown}
              onClaim={claim}
            />
          ))}
        </div>

        {canScrollLeft && (
          <div className="claim-scroll-button left" onClick={() => scroll(-1)}>
            <i className="pi pi-arrow-left"></i>
          </div>
        )}

        {canScrollRight && (
          <div className="claim-scroll-button right" onClick={() => scroll(1)}>
            <i className="pi pi-arrow-right"></i>
          </div>
        )}
      </div>
    </div>
  );
};

interface CreditClaimCard {
  day: number;
  amount: number;
  claiming?: boolean;
  claimed?: boolean;
  current?: boolean;
  expiryMs?: number;
  availableInMs?: number;
  onClaim?: () => void;
}

const CreditClaimCard: FC<CreditClaimCard> = (props) => {
  const { isAuthenticated, isConnected } = useWallet();

  const { setShowAuthFlow, setShowDynamicUserProfile } = useDynamicContext();

  const availableIn = props.availableInMs
    ? dayjs.duration(props.availableInMs).format('HH[h] mm[m]')
    : '';

  const expiresIn = props.expiryMs
    ? dayjs.duration(props.expiryMs).format('HH[h] mm[m]')
    : '';

  const hasCountdown = availableIn || expiresIn;

  const join = useCallback(() => {
    isConnected ? setShowDynamicUserProfile(true) : setShowAuthFlow(true);
  }, [isConnected, setShowAuthFlow, setShowDynamicUserProfile]);

  return (
    <div
      className={classNames('credit-claim-card min-w-[7rem]', {
        claimed: props.claimed,
        current: props.current,
      })}
    >
      <div className="claim-day">Day {props.day}</div>

      <div className="claim-xp">+{props.amount}</div>

      {props.current && props.day > 1 && hasCountdown && (
        <div className="claim-countdown">
          {availableIn ? 'Ready in' : 'Expires in'}

          <br />
          {availableIn || expiresIn}
        </div>
      )}

      {props.claimed && <span className="claimed-label">Claimed</span>}

      {!isAuthenticated && (
        <Button className="px-4 py-2" onClick={join}>
          Claim
        </Button>
      )}

      {isAuthenticated && !props.claimed && (
        <Button
          loading={props.current && props.claiming}
          disabled={
            !props.current || (props.availableInMs ?? 0) > 0 || !isAuthenticated
          }
          className="px-2"
          onClick={props.onClaim}
        >
          {props.current && props.claiming ? 'Claiming' : 'Claim'}
        </Button>
      )}
    </div>
  );
};
