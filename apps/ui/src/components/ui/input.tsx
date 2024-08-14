import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      helperText,
      startAdornment,
      endAdornment,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn('flex flex-col', className)}>
        {label && <label className="mb-1 text-sm text-gray-700">{label}</label>}
        <div
          className={cn(
            props.disabled ? 'cursor-not-allowed opacity-50' : '',
            'relative flex h-10 w-full items-center rounded-md border border-border bg-background/5 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {startAdornment && (
            <span className="px-3 text-sm text-muted-foreground">
              {startAdornment}
            </span>
          )}
          <input
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border-none bg-transparent px-3 text-sm ring-offset-transparent transition file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              className,
            )}
            ref={ref}
            {...props}
          />
          {endAdornment && (
            <span
              title={endAdornment.toString()}
              className="absolute right-0 max-w-32 overflow-hidden text-ellipsis text-nowrap px-3 text-sm font-medium text-muted-foreground"
            >
              {endAdornment}
            </span>
          )}
        </div>
        {helperText && (
          <span className="mt-1 text-xs text-muted-foreground">
            {helperText}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
