import { FC } from 'react';

export const MyBetPanel: FC = () => {
  return (
    <div className="my-bet-panel">
      <div className="fighter-bet">
        <div className="fighter-tile">
          <img src="/doge.svg" />
          DOGE
        </div>

        <div className="bet-purchase-price mt-3 flex justify-content-between text-white">
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
      </div>

      <div className="spacer">
        <div className="separator"></div>
      </div>

      <div className="fighter-bet">
        <div className="fighter-tile">
          <img src="/pepe.svg" />
          PEPE
        </div>

        <div className="bet-purchase-price mt-3 flex justify-content-between text-white">
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
      </div>
    </div>
  );
};
