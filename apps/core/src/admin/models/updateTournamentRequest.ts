export interface UpdateTournamentRequest {
  displayName: string;
  description: string;
  startDate: string;
  endDate: string;
  prizes: {
    title: string;
    description: string;
  }[];
}
