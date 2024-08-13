import { FC, useCallback } from 'react';

interface SoundToggleProps {
  muted?: boolean;
  onChange?: (isMuted: boolean) => void;
}

export const SoundToggle: FC<SoundToggleProps> = ({ muted, onChange }) => {
  const handleChange = useCallback(() => onChange?.(!muted), [muted, onChange]);

  return (
    <button
      className="hover:border-primary-500 hover:bg-primary-300/40 absolute bottom-3 left-4 flex size-12 items-center justify-center rounded-full bg-slate-200/20 hover:border"
      onClick={handleChange}
    >
      <i
        className={`pi ${muted ? 'pi-volume-off' : 'pi-volume-up text-xl'}`}
      ></i>
      {muted && <i className="pi pi-times"></i>}
    </button>
  );
};
