export interface CreateTournamentRequest {
  codeName: string;
  displayName: string;
  description: string;
  startDate: string;
  rounds: number;
  prizes: {
    title: string;
    description: string;
    imagePath?: string;
  }[];
}
