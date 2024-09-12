import React from 'react';
import { cn } from '@/lib/utils';
import styles from './DotSpinner.module.scss';

interface DotSpinnerProps {
  className?: string;
}

const DotSpinner: React.FC<DotSpinnerProps> = ({ className }) => {
  return (
    <div
      className={cn(
        styles['loader-dots'],
        'flex w-full justify-center gap-2',
        className,
      )}
    >
      <div className="size-3 rounded-full bg-gradient-to-r from-[#eae564] to-[#d9a76c]" />
      <div className="size-3 rounded-full bg-gradient-to-r from-[#d9a76c] to-[#c96675]" />
      <div className="size-3 rounded-full bg-gradient-to-r from-[#c96675] to-[#b8277c]" />
    </div>
  );
};

export default DotSpinner;
