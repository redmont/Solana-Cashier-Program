import { FC, ReactNode, useMemo, useRef } from 'react';
import {
  Tooltip as PRTooltip,
  TooltipProps as PRTooltipProps,
} from 'primereact/tooltip';

export interface TooltipProps
  extends Omit<PRTooltipProps, 'target' | 'content'> {
  content: ReactNode;
  children: ReactNode;
}

const defaultProps: PRTooltipProps = {
  mouseTrack: true,
  showDelay: 100,
  position: 'top',
};

export const Tooltip: FC<TooltipProps> = ({
  children,
  content,
  ...tooltipProps
}) => {
  const targetRef = useRef<HTMLDivElement>(null);

  const mergedProps = useMemo(
    () => ({
      ...defaultProps,
      ...tooltipProps,
    }),
    [tooltipProps],
  );

  return (
    <>
      <div ref={targetRef} style={{ display: 'contents' }}>
        {children}
      </div>
      <PRTooltip target={targetRef} {...mergedProps}>
        {content}
      </PRTooltip>
    </>
  );
};
