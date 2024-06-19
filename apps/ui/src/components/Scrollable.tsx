'use client';

import { ReactNode, forwardRef } from 'react';
import {
  OverlayScrollbarsComponent,
  OverlayScrollbarsComponentRef,
} from 'overlayscrollbars-react';
import { ScrollbarsAutoHideBehavior } from 'overlayscrollbars';

export interface ScrollableProps {
  children?: ReactNode;
  className?: string;
  autoHide?: ScrollbarsAutoHideBehavior;
}

export type { OverlayScrollbarsComponentRef as ScrollableRef };

export const Scrollable = forwardRef<
  OverlayScrollbarsComponentRef,
  ScrollableProps
>((props, ref) => {
  return (
    <OverlayScrollbarsComponent
      ref={ref}
      defer
      className={props.className}
      options={{
        scrollbars: {
          autoHide: props.autoHide ?? 'leave',
          autoHideDelay: 1000,
          theme: 'os-theme-light',
        },
      }}
    >
      {props.children}
    </OverlayScrollbarsComponent>
  );
});
