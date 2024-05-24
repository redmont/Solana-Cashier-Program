export interface CreateTournamentRequest {
  codeName: string;
  displayName: string;
  description: string;
  startDate: string;
  endDate: string;
  prizes: {
    title: string;
    description: string;
  }[];
}
