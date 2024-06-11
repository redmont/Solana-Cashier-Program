import { FC, useCallback } from 'react';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';

interface SoundToggleProps {
  muted?: boolean;
  onChange?: (isMuted: boolean) => void;
}

export const SoundToggle: FC<SoundToggleProps> = ({ muted, onChange }) => {
  const handleChange = useCallback(() => onChange?.(!muted), [muted, onChange]);

  return (
    <Button
      className={classNames('video-stream-unmute-button', { muted })}
      rounded
      onClick={handleChange}
    >
      <i className={`pi ${muted ? 'pi-volume-off' : 'pi-volume-up'}`}></i>
      {muted && <i className="pi pi-times"></i>}
    </Button>
  );
};
