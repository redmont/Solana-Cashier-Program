'use client';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { Check, CircleAlert } from 'lucide-react';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex w-full items-center gap-3">
              <div>
                {(!props.variant || props.variant === 'default') && (
                  <Check className="size-8 text-primary-950" />
                )}

                {(!props.variant || props.variant === 'destructive') && (
                  <CircleAlert className="size-8 text-destructive-foreground/80" />
                )}
              </div>
              <div className="max-w-full overflow-hidden pr-10">
                {title && <ToastTitle className="text-lg">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="overflow-hidden text-ellipsis">
                    {description}
                  </ToastDescription>
                )}
              </div>
              {action}
              <ToastClose />
            </div>
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
