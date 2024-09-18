'use client';

import React from 'react';

const Blocked: React.FC = () => {
  return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">
          BRAWL3RS is not available in your region.
        </h1>
        <p className="mt-2 text-lg">
          This website and its services are not available in your country.
          <br />
          If you are using a VPN, please disable it and try again.
        </p>
      </div>
    </div>
  );
};

export default Blocked;
