'use client';

import { useAtom } from 'jotai';
import { activeBlock, ActiveWidget } from '@/store/view';

import { BetPlacementWidget } from '@/components/betPlacementWidget';
import { StakeWidget } from '@/components/stakeWidget';
import { FightCardWidget } from '@/components/fightCardWidget';
import { MatchResultWidget } from '@/components/matchResultWidget';
import { MatchStreamWidget } from '@/components/matchStreamWidget';
import { MatchStatusWidget } from '@/components/matchStatusWidget';
import { ChatWidget } from '@/components/chatWidget/ChatWidget';
import { MobileFooter } from '@/components/mobileFooter';

export default function Home() {
  const [currentWidget] = useAtom(activeBlock);

  const chatVisibility =
    currentWidget.activeWidget === ActiveWidget.ChatWidget
      ? 'show-chat'
      : 'hide-chat';

  return (
    <main className={`main-page ${chatVisibility}`}>
      <div className="main-page-content">
        <MatchStreamWidget />
        <MatchStatusWidget />
        <FightCardWidget />
        <MatchResultWidget />
        <BetPlacementWidget />
        <StakeWidget />
        <ChatWidget />
      </div>
      <MobileFooter />
    </main>
  );
}
