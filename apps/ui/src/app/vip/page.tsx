'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useAtomValue, useSetAtom } from 'jotai';
import { orderBookAtom } from '@/store/view';
import { useMutation } from '@tanstack/react-query';

const VIP: React.FC = () => {
  const orderBook = useAtomValue(orderBookAtom);
  const setOrderBook = useSetAtom(orderBookAtom);

  const handleChangeOrderbook = useMutation({
    mutationFn: async () => {
      setOrderBook(orderBook === 'vip' ? 'standard' : 'vip');
    },
  });

  return (
    <div className="m-auto flex w-full justify-center sm:max-w-[1000px]">
      <Button onClick={() => handleChangeOrderbook.mutate()}>
        Switch to {orderBook === 'vip' ? 'Standard' : 'VIP'} order book
      </Button>
    </div>
  );
};

export default VIP;
