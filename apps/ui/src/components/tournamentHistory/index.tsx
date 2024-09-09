import { history } from './data';

const TournamentHistory = () => {
  return (
    <div className="px-2">
      <div className="mt-2 grid grid-cols-4 px-2 py-3">
        <div>Tournament Name</div>
        <div className="flex justify-center">Place</div>
        <div>XP</div>
        <div className="flex justify-end">Result</div>
      </div>
      <div className="space-y-2">
        {history.map((item, index) => (
          <div
            className="grid grid-cols-4 items-center rounded-md border border-border bg-[#0c0c0e] p-2"
            key={index}
          >
            <div>{item.tournamentName}</div>
            <div className="flex justify-center">
              <img src="/prizes/1st.svg" alt="prize" />
            </div>
            <div>{item.xp}</div>
            <div className="flex justify-end">{item.result}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentHistory;
