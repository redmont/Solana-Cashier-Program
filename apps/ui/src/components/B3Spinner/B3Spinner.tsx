import React from 'react';
import B from './B.svg';
import Three from './3.svg';
import crack from './crack.png';
import styles from './B3Spinner.module.scss';
import { cn } from '@/lib/utils';
import DotSpinner from '../dotSpinner/DotSpinner';

type Props = {
  withDots?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
};

const B3Spinner: React.FC<Props> = ({ withDots, size }) => {
  return (
    <div
      className={cn(
        'relative flex aspect-video w-32 flex-col justify-center pb-6',
        {
          'pb-0': !withDots,
          'w-12': size === 'xs',
          'w-24': size === 'sm',
          'w-48': size === 'lg',
          'w-64': size === 'xl',
          'w-80': size === '2xl',
        },
      )}
    >
      <div className={cn('relative ml-[5%] pl-[20%] pt-[25%]')}>
        <img
          src={crack.src}
          className={cn(
            'absolute left-0 top-0 z-10 w-[60%] opacity-50',
            styles['crack'],
          )}
        />
        <img
          className={cn('inline-block w-[50%]', styles['B'])}
          src={B.src}
          alt="B"
        />
        <img
          className={cn('inline-block w-[50%]', styles['Three'])}
          src={Three.src}
          alt="3"
        />
      </div>
      <div className="flex w-full items-center justify-center">
        <DotSpinner
          className={cn('mt-2 w-[66%]', {
            hidden: !withDots,
          })}
        />
      </div>
    </div>
  );
};

export default B3Spinner;
