'use client';

import { BetPlacementWidget } from '@/components/betPlacementWidget';
import { StakeWidget } from '@/components/stakeWidget';
import { FightCardWidget } from '@/components/fightCardWidget';
import { MatchResultWidget } from '@/components/matchResultWidget';
import { MatchStreamWidget } from '@/components/matchStreamWidget';
import { MatchStatusWidget } from '@/components/matchStatusWidget';
import { ChatWidget } from '@/components/chatWidget/ChatWidget';

export default function Home() {
  return (
    <main className="main-page">
      <div className="main-page-content">
        <MatchStreamWidget />
        <FightCardWidget />
        <MatchStatusWidget />
        <MatchResultWidget />
        <BetPlacementWidget />
        <StakeWidget />
        <ChatWidget />
      </div>
    </main>
  );
}
