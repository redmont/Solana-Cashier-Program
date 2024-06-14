'use client';

import { ReactNode, forwardRef } from 'react';
import {
  OverlayScrollbarsComponent,
  OverlayScrollbarsComponentRef,
} from 'overlayscrollbars-react';

export interface ScrollableProps {
  children?: ReactNode;
  className?: string;
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
          autoHide: 'leave',
          autoHideDelay: 0,
          theme: 'os-theme-light',
        },
      }}
    >
      {props.children}
    </OverlayScrollbarsComponent>
  );
});
