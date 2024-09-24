import Head from 'next/head';
import { FC, PropsWithChildren, useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { useAtomValue } from 'jotai';
import { fightersAtom } from '@/store/match';

const DexScreenerEmbed: FC<PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const fighters = useAtomValue(fightersAtom);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger onClick={() => setOpen(true)} asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-xl sm:max-w-3xl md:max-w-7xl">
        <div className="flex flex-col gap-8 md:grid md:grid-cols-2 md:gap-12">
          <div className="h-80 md:h-[40rem]">
            <Head>
              <style>{`
          #dexscreener-embed {
            position: relative;
            width: 100%;
            padding-bottom: 125%;
          }
          @media (min-width: 1400px) {
            #dexscreener-embed {
              padding-bottom: 65%;
            }
          }
          #dexscreener-embed iframe {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            border: 0;
          }
        `}</style>
            </Head>
            <div id="dexscreener-embed" className="h-full">
              <iframe
                src={`https://dexscreener.com/${fighters[0]?.tokenChainId}/${fighters[0]?.tokenAddress}?embed=1&theme=dark&trades=1&timeframe=1s&chart=1&info=1`}
                className="size-full"
              />
            </div>
          </div>
          <div className="h-80 md:h-[40rem]">
            <Head>
              <style>{`
          #dexscreener-embed {
            position: relative;
            width: 100%;
            padding-bottom: 125%;
          }
          @media (min-width: 1400px) {
            #dexscreener-embed {
              padding-bottom: 65%;
            }
          }
          #dexscreener-embed iframe {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            border: 0;
          }
        `}</style>
            </Head>
            <div id="dexscreener-embed" className="h-full">
              <iframe
                src={`https://dexscreener.com/${fighters[1]?.tokenChainId}/${fighters[1]?.tokenAddress}?embed=1&theme=dark&trades=1&timeframe=1s&chart=1&info=1`}
                className="size-full"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DexScreenerEmbed;
