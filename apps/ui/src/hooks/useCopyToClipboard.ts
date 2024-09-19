'use client';

import { useToast } from '@/components/ui/use-toast';
import { useState, useCallback } from 'react';

const useCopyToClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        toast({
          title: 'Copied to clipboard',
          variant: 'default',
          duration: 5000,
        });
        setCopyError(null);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        setCopyError('Failed to copy');
      }
    },
    [toast],
  );

  return { isCopied, copyError, copyToClipboard };
};

export default useCopyToClipboard;
