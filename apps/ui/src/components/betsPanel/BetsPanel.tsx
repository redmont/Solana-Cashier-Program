import { FC } from 'react';

export const BetsPanel: FC = () => {
  return (
    <div className="bets-panel">
      <div className="bets-panel-header">
        <div className="bet-column">
          <div className="bet-fighter">Doge</div>
          <div className="bet-points-total">34000 Points</div>
        </div>

        <div className="bet-column">
          <div className="bet-fighter">Pepe</div>
          <div className="bet-points-total">34000 Points</div>
        </div>
      </div>

      <div className="bets-panel-list">
        <div className="bet-row">
          <div className="bet-value"></div>
          <div className="bet-placer">0x0012...0987</div>
          <div className="bet-value">200</div>
        </div>

        <div className="bet-row">
          <div className="bet-value">200</div>
          <div className="bet-placer">0x0012...0987</div>
          <div className="bet-value"></div>
        </div>

        <div className="bet-row">
          <div className="bet-value"></div>
          <div className="bet-placer">0x3214...6523</div>
          <div className="bet-value">100</div>
        </div>

        <div className="bet-row">
          <div className="bet-value">300</div>
          <div className="bet-placer">0xfda1...d091</div>
          <div className="bet-value"></div>
        </div>
      </div>
    </div>
  );
};
