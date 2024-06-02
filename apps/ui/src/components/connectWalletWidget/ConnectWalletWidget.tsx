import { FC, useState } from 'react';
import { JoinButton } from '@/components/JoinButton';
import { Slider } from '@/components/slider';

export const ConnectWalletWidget: FC = () => {
  const [val, setVal] = useState(20);
  return (
    <div className="widget connect-wallet-widget">
      <div className="widget-body framed">
        {/* <JoinButton size="large" /> */}
        <Slider value={val} onValueChange={setVal} />
      </div>
    </div>
  );
};
