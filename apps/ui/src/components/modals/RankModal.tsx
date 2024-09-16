import { FC, PropsWithChildren, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Scrollable } from '../ui/scrollable';
import { ranks } from '@/hooks/useRankCal';
import { formatCompact } from '@/utils';

interface RankModalProps extends PropsWithChildren {
  currentRank: string;
}

const RankModal: FC<RankModalProps> = ({ children, currentRank }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger onClick={() => setOpen(true)} asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Brawlers Ranks</DialogTitle>
        </DialogHeader>
        <Scrollable className="h-80 w-full md:h-[30rem]">
          {ranks.map((item, index) => (
            <div className="flex items-center gap-4 p-2" key={index}>
              <img
                src={`/progression_system_belts/${item.image}`}
                alt="brawler"
                className="w-12"
              />
              <div className="flex flex-col">
                <p className="flex items-center gap-2">
                  <span className="font-semibold text-gold">{item.name}</span>
                  {currentRank === item.name && (
                    <span className="flex size-fit items-center rounded-md bg-[#4CDC8814] px-1 text-sm text-primary">
                      current
                    </span>
                  )}
                </p>
                <span className="text-sm text-white">
                  {formatCompact(item.xp)} XP
                </span>
              </div>
            </div>
          ))}
        </Scrollable>
      </DialogContent>
    </Dialog>
  );
};

export default RankModal;
