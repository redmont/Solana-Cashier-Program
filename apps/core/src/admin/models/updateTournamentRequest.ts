export interface UpdateTournamentRequest {
  displayName: string;
  description: string;
  startDate: string;
  rounds: number;
  prizes: {
    title: string;
    description: string;
  }[];
}
