'use client';

import { CreditClaimWidget } from '@/components/creditClaimWidget';
import { useMemo } from 'react';
import { useSocket, useWallet } from '@/hooks';
import {
  GetTournamentMessage,
  GetTournamentMessageResponse,
  GetUserMatchHistoryMessage,
  GetUserMatchHistoryMessageResponse,
  GetUserProfileMessage,
  GetUserProfileMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { useQuery } from '@tanstack/react-query';
import ProfileWidget from '@/components/profileWidget';
import BalanceWidget from '@/components/balanceWidget';
import ChallengesWidget from '@/components/challengesWidget';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { redirect } from 'next/navigation';
import WithdrawalHistoryWidget from '@/components/withdrawalHistoryWidget';

export default function Profile() {
  const challengesFeature = useFeatureFlag('challenges');
  const withdrawalsFeature = useFeatureFlag('withdrawals');
  const { isAuthenticated } = useWallet();
  const { send, connected } = useSocket();

  const matchHistory = useQuery({
    queryKey: ['matchHistory'],
    queryFn: () =>
      send<GetUserMatchHistoryMessage, GetUserMatchHistoryMessageResponse>(
        new GetUserMatchHistoryMessage(),
      ),
    enabled: connected,
  });

  const userXp = useQuery({
    queryKey: ['userXp'],
    queryFn: () =>
      send<GetUserProfileMessage, GetUserProfileMessageResponse>(
        new GetUserProfileMessage(),
      ),
    enabled: connected,
  });

  // TODO uncouple with challenges data?
  const tournamentData = useQuery({
    queryKey: ['tournamentData'],
    queryFn: () =>
      send<GetTournamentMessage, GetTournamentMessageResponse>(
        new GetTournamentMessage('xp', 100, 1),
      ),
    enabled: connected,
  });

  // TODO move to server side match history call
  const totalAmountWon = useMemo(
    () =>
      (matchHistory.data?.matches ?? []).reduce(
        (sum, match) => sum + parseFloat(match.winAmount),
        0,
      ),
    [matchHistory.data],
  );

  if (connected && !isAuthenticated) {
    // there's no guarantee that dynamicauth has loaded by the time the socket is connected
    // so could be dangerous. Open to suggestions here, but I say wait until server side auth.
    redirect('/');
  }

  return (
    <main className="grid w-full grid-cols-1 grid-rows-[1fr_1fr_36rem] gap-4 sm:grid-cols-2 sm:grid-rows-[22rem_28rem] lg:grid-cols-4">
      <div className="row-span-2 flex w-full flex-col gap-4 sm:col-span-2 sm:row-span-1 sm:grid sm:grid-cols-3">
        <ProfileWidget
          className="sm:col-span-2"
          playedGames={matchHistory.data?.matches.length ?? 0}
          progress={userXp.data?.xp ?? 0}
          totalAmountWon={totalAmountWon}
        />
        <BalanceWidget className="w-full" />
      </div>
      <div className="col-span-2 row-span-2 flex flex-col gap-4">
        <CreditClaimWidget />
        {challengesFeature && (
          <ChallengesWidget
            className="col-span-2"
            endDate={tournamentData?.data?.endDate}
          />
        )}
      </div>
      {withdrawalsFeature && (
        <div className="col-span-2 row-start-3 sm:row-start-2">
          <WithdrawalHistoryWidget className="h-full" />
        </div>
      )}
    </main>
  );
}
