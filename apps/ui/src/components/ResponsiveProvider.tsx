'use client';

import React, { createContext, useEffect, useState, useMemo } from 'react';

export interface ResponsiveContextValue {
  breakpoint: number;
}

export const ResponsiveContext = createContext<ResponsiveContextValue>({
  breakpoint: 0,
});

export interface ResponsivenessProps {
  breakpoints?: number[];
  children?: React.ReactNode;
}

export function ResponsiveProvider({
  breakpoints = [480, 768, 1024, 1200],
  children,
}: ResponsivenessProps) {
  const defaultBp = detectCurrentBreakpoint(breakpoints);
  const [currentBp, setCurrentBp] = useState<number>(defaultBp);

  useEffect(() => {
    const handler = () => {
      const bp = detectCurrentBreakpoint(breakpoints);
      if (bp !== currentBp) {
        setCurrentBp(bp);
      }
    };

    window.addEventListener('resize', handler);

    return window.removeEventListener('resize', handler);
  }, [currentBp, breakpoints]);

  const contextVal: ResponsiveContextValue = useMemo(
    () => ({
      breakpoint: currentBp,
    }),
    [currentBp],
  );

  return (
    <ResponsiveContext.Provider value={contextVal}>
      {children}
    </ResponsiveContext.Provider>
  );
}

function detectCurrentBreakpoint(scale: number[]) {
  scale = [...scale].sort((a, b) => a - b);

  let breakpoint = scale[0];

  for (let i = 1; i < scale.length; i++) {
    const next = scale[i];
    if (window.innerWidth <= next) {
      break;
    }
    breakpoint = scale[i];
  }

  return breakpoint;
}
