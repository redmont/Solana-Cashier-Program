'use client';

import React, { useState } from 'react';
import { isDev } from '@/config/env';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';

const DevMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const addAlert = (type: 'default' | 'destructive') => {
    toast({
      title: 'Alert',
      description: 'This is a test alert',
      variant: type,
    });
  };

  return (
    isDev && (
      <div className="fixed bottom-2 right-2 z-50">
        <Button size="sm" className="mb-1 flex gap-3" onClick={toggleOpen}>
          Dev Menu
          {isOpen ? (
            <ChevronDown className="size-6" />
          ) : (
            <ChevronUp className="size-6" />
          )}
        </Button>
        {isOpen && (
          <div className="flex flex-wrap gap-3 rounded-md bg-foreground p-5">
            <Button onClick={() => addAlert('default')}>Success Alert</Button>
            <Button
              variant="destructive"
              onClick={() => addAlert('destructive')}
            >
              Error Alert
            </Button>
          </div>
        )}
      </div>
    )
  );
};

export default DevMenu;
