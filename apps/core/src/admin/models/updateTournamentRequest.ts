export interface UpdateTournamentRequest {
  displayName: string;
  description: string;
  startDate: string;
  rounds: number;
  currentRound: number;
  prizes: {
    title: string;
    description: string;
    imagePath?: string;
  }[];
}
