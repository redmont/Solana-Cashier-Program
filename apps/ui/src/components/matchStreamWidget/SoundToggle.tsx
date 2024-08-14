import { cn } from '@/lib/utils';
import { FC, useCallback } from 'react';

interface SoundToggleProps {
  muted?: boolean;
  onChange?: (isMuted: boolean) => void;
}

export const SoundToggle: FC<SoundToggleProps> = ({ muted, onChange }) => {
  const handleChange = useCallback(() => onChange?.(!muted), [muted, onChange]);

  return (
    <button
      className={cn(
        !muted && 'bg-primary text-black',
        muted && 'bg-slate-200/20',
        'absolute bottom-3 left-4 flex size-10 items-center justify-center rounded-full ring-primary ring-offset-2 ring-offset-black hover:border hover:border-primary-500 hover:bg-primary-300/40 focus:ring-2',
      )}
      onClick={handleChange}
    >
      <i
        className={`pi ${muted ? 'pi-volume-off' : 'pi-volume-up text-xl'}`}
      ></i>
      {muted && <i className="pi pi-times"></i>}
    </button>
  );
};
