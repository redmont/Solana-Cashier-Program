export const HistoricalBetPanel = () => {
  return (
    <div className="historical-bet-panel">
      <div className="result-text">You have won 50 Points</div>

      <div className="fighters">
        <div className="fighter">
          <img src="/doge.svg" />
          DOGE
        </div>

        <span>VS</span>

        <div className="fighter">
          PEPE
          <img src="/pepe.svg" />
        </div>
      </div>

      <div className="points">
        <div className="">$26</div>
        <div className="text-3xl line-height-0">2600 Points</div>
        <div className="font-bold">+50</div>
      </div>
    </div>
  );
};
