'use client';

import { FC, ReactNode } from 'react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

export interface ScrollableProps {
  children?: ReactNode;
  className?: string;
}

export const Scrollable: FC<ScrollableProps> = (props) => {
  return (
    <OverlayScrollbarsComponent
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
};
