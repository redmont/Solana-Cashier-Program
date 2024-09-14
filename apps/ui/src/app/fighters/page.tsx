'use client';

import React from 'react';
import { FighterRosterWidget } from '@/components/fighterRosterWidget';

const Fighters: React.FC = () => {
  return (
    <div className="m-auto flex w-full justify-center sm:max-w-[1000px]">
      <FighterRosterWidget />
    </div>
  );
};

export default Fighters;
