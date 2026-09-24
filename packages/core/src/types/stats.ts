export interface DashboardStats {
  total_games_finished: number;
  games_finished_this_month: number;
  total_hours_played_this_month: number;
  total_hours_played: number;
  most_used?: string;
  second_most_used?: string;
  least_used?: string;
}

export interface LandingPageStats {
  registeredPlayers: number;
  beatedGames: number;
  totalHours: number;
}
