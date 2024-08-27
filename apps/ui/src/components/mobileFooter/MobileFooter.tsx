'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { BetPlacementWidget } from '@/components/betPlacementWidget';
import { useAtom } from 'jotai';
import { usePathname } from 'next/navigation';
import { ActiveWidget, activeBlock } from '@/store/view';
import { Brawlers } from '@/icons';

const footerNavLinkClass =
  'flex flex-col items-center justify-center text-sm font-bold';

const MobileFooter: React.FC = () => {
  const currentPath = usePathname();
  const [currentWidget, setCurrentWidget] = useAtom(activeBlock);

  const [visibleBottom, setVisibleBottom] = useState(false);

  const toggleDrawer = () => {
    setVisibleBottom(!visibleBottom);
  };

  useEffect(() => {
    if (visibleBottom) {
      setCurrentWidget({ activeWidget: ActiveWidget.MatchStreamWidget });
    } else {
      setCurrentWidget({ activeWidget: ActiveWidget.BetListWidget });
    }
  }, [visibleBottom, setCurrentWidget]);

  if (currentPath === '/tournament') {
    return null;
  }

  return (
    <>
      <div className="fixed inset-x-2 bottom-2 grid grid-cols-3 items-center gap-4 rounded-md border border-border bg-foreground p-4 sm:hidden">
        <Button
          className={`${footerNavLinkClass} ${currentWidget.activeWidget === ActiveWidget.BetListWidget ? 'text-green-400' : 'text-white'}`}
          size="large"
          unstyled={true}
          onClick={() =>
            setCurrentWidget({ activeWidget: ActiveWidget.BetListWidget })
          }
          icon={<i className="pi pi-align-left text-2xl" />}
        >
          Stats
        </Button>
        <Button
          className={`${footerNavLinkClass} ${currentWidget.activeWidget === ActiveWidget.MatchStreamWidget ? 'text-green-400' : 'text-white'} custom-icon`}
          size="large"
          onClick={toggleDrawer}
          unstyled={true}
          icon={<Brawlers />}
        >
          Place stake
        </Button>
        <Button
          className={`${footerNavLinkClass} ${currentWidget.activeWidget === ActiveWidget.ChatWidget ? 'text-green-400' : 'text-white'}`}
          size="large"
          unstyled={true}
          icon={<i className="pi pi-comments text-2xl" />}
          onClick={() =>
            setCurrentWidget({ activeWidget: ActiveWidget.ChatWidget })
          }
        >
          Chat
        </Button>
      </div>

      <Sidebar
        visible={visibleBottom}
        showCloseIcon={false}
        position="bottom"
        onHide={() => setVisibleBottom(false)}
        className="footer-mobile-menu-drawer flex h-fit max-h-[65vh] rounded-md bg-foreground sm:hidden"
      >
        {visibleBottom && <BetPlacementWidget />}
      </Sidebar>
    </>
  );
};

export default MobileFooter;
