import { FC } from 'react';
import { Slider } from 'primereact/slider';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

export const BetInputPanel: FC = () => {
  return (
    <div className="bet-input-panel">
      <div className="input-section">
        <div className="fighter-selection">
          <div className="selection-title">Choose a fighter</div>
          <div className="fighter-switch">
            <div className="fighter-tile selected">
              <img src="/doge.svg" />
              DOGE
            </div>
            <span>VS</span>
            <div className="fighter-tile">
              PEPE
              <img src="/pepe.svg" />
            </div>
          </div>
        </div>

        <div className="spacer"></div>

        <div className="points-selection">
          <div className="selection-title">Buy shares in fight pool</div>

          <div className="points-slider-box">
            <div className="points-slider-labels">
              <span>0%</span>
              <span>100%</span>
            </div>
            <Slider />
          </div>

          <div className="points-input-group p-inputgroup">
            <InputText />
            <span className="p-inputgroup-addon">Points</span>
          </div>
        </div>
      </div>
      <div className="confirmation-section">
        <div className="bet-preview-title">Bet preview</div>
        <div className="bet-purchase-price flex justify-content-between  text-white">
          <span>Purchased Price:</span>
          <span>50 points</span>
        </div>

        <div className="bet-win-rewards mt-2 flex justify-content-between text-white">
          <span>Win Rewards:</span>
          <span>100 points</span>
        </div>

        <div className="bet-win-rewards-comment text-white">
          (pro-rate share of opponent pool)
        </div>

        <div className="spacer"></div>

        <div className="mb-3 text-white">
          Bets cannot be deleted or edited.
          <br />
          You will place a bet without any further confirmations.
        </div>
        <Button label="Place a Bet" size="large" className="w-full" />
      </div>
    </div>
  );
};
