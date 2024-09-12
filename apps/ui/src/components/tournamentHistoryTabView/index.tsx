import MatchHistory from '@/components/matchHistory';
import B3Spinner from '@/components/B3Spinner/B3Spinner';
import SomethingWentWrong from '@/components/somethingWentWrong';
import TournamentHistory from '@/components/tournamentHistory';

import {
  GetUserMatchHistoryMessage,
  GetUserMatchHistoryMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { TabPanel, TabView } from 'primereact/tabview';
import { useQuery } from '@tanstack/react-query';
import { useSocket } from '@/hooks';

const TournamentHistoryTabView = () => {
  const { send, connected } = useSocket();

  const matchHistory = useQuery({
    queryKey: ['matchHistory'],
    queryFn: () =>
      send<GetUserMatchHistoryMessage, GetUserMatchHistoryMessageResponse>(
        new GetUserMatchHistoryMessage(),
      ),
    enabled: connected,
  });

  return (
    <TabView className="tab-view size-full" activeIndex={0}>
      <TabPanel
        header="Fights history"
        className="size-full"
        headerClassName="tab-header  py-2 justify-end"
      >
        {matchHistory.isLoading && <B3Spinner />}
        {matchHistory.isError && (
          <div className="flex size-full flex-col items-center justify-center py-10">
            <SomethingWentWrong size="xl" />
          </div>
        )}
        {matchHistory.isSuccess && (
          <MatchHistory history={matchHistory.data.matches} />
        )}
      </TabPanel>

      <TabPanel header="Tournament results" headerClassName="tab-header">
        <TournamentHistory />
      </TabPanel>
    </TabView>
  );
};

export default TournamentHistoryTabView;
