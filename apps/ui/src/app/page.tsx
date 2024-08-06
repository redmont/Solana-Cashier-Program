'use client';

import { BetPlacementWidget } from '@/components/betPlacementWidget';
import { StakeWidget } from '@/components/stakeWidget';
import { BetListWidget } from '@/components/betListWidget';
import { MatchResultWidget } from '@/components/matchResultWidget';
import { MatchStreamWidget } from '@/components/matchStreamWidget';
import { MatchStatusWidget } from '@/components/matchStatusWidget';
import { ChatWidget } from '@/components/chatWidget';

export default function Home() {
  return (
    <main className="main-page">
      <div className="main-page-content">
        <MatchStreamWidget />
        <BetListWidget />
        <MatchStatusWidget />
        <MatchResultWidget />
        <BetPlacementWidget />
        <StakeWidget />
        <ChatWidget />
      </div>
    </main>
  );
}
