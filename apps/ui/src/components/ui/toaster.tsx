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

const DEFAULT_TIMEOUT_DURATION = 4000;

const ProgressBar = ({
  duration,
  variant,
}: {
  duration: number;
  variant: 'default' | 'destructive';
}) => {
  return (
    <div className="absolute -left-4 bottom-0 h-1 w-full overflow-hidden rounded-full bg-transparent">
      {(!variant || variant === 'default') && (
        <div
          className="h-full animate-progress bg-primary-900"
          style={{ animationDuration: `${duration}ms` }}
        />
      )}

      {(!variant || variant === 'destructive') && (
        <div
          className="h-full animate-progress bg-red-900"
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
};

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const duration = props.duration ?? DEFAULT_TIMEOUT_DURATION;
        return (
          <Toast
            key={id}
            {...props}
            duration={duration}
            className="flex w-full flex-col"
          >
            <div className="flex w-full flex-col">
              <div className="flex items-center gap-3">
                <div>
                  {(!props.variant || props.variant === 'default') && (
                    <Check className="size-8 text-primary-950" />
                  )}

                  {(!props.variant || props.variant === 'destructive') && (
                    <CircleAlert className="size-8 text-destructive-foreground/80" />
                  )}
                </div>
                <div className="max-w-full overflow-hidden pr-10">
                  {title && (
                    <ToastTitle className="text-lg">{title}</ToastTitle>
                  )}
                  {description && (
                    <ToastDescription className="overflow-hidden text-ellipsis">
                      {description}
                    </ToastDescription>
                  )}
                </div>
                {action}
                <ToastClose />
              </div>
            </div>
            <ProgressBar
              duration={duration}
              variant={props.variant ?? 'default'}
            />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
