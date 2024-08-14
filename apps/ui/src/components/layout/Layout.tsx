'use client';

import React from 'react';
import { ChildContainerProps } from '@/types';
import { TutorialDialog } from '@/components/tutorialDialog';
import { Navbar } from '../navbar/Navbar';

export const Layout = (props: ChildContainerProps) => {
  return (
    <div className="mx-auto w-full max-w-[1568px] px-2 pt-1">
      <TutorialDialog />
      <Navbar />
      {props.children}
    </div>
  );
};
