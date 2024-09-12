import { cn } from '@/lib/utils';
import { FC } from 'react';
import { useAtom } from 'jotai';
import { soundsOnAtom } from '@/store/app';

interface SoundToggleProps {}

export const SoundToggle: FC<SoundToggleProps> = () => {
  const [soundsOn, setSoundsOn] = useAtom(soundsOnAtom);

  return (
    <button
      className={cn(
        soundsOn && 'bg-primary text-black',
        !soundsOn && 'bg-slate-200/20',
        'absolute bottom-3 left-4 flex size-10 items-center justify-center rounded-full ring-primary ring-offset-2 ring-offset-black hover:border hover:border-primary-500 hover:bg-primary-300/40 focus:ring-2',
      )}
      onClick={() => setSoundsOn(!soundsOn)}
    >
      <i
        className={`pi ${!soundsOn ? 'pi-volume-off' : 'pi-volume-up text-xl'}`}
      ></i>
      {!soundsOn && <i className="pi pi-times"></i>}
    </button>
  );
};
