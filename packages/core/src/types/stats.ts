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

export interface ConsoleGameCount {
  console_id: number;
  name_console: string;
  game_count: number;
  percentage_console: number;
}

export interface GenreGameCount {
  genre_id: number;
  name_genre: string;
  genre_count: number;
  percentage_genre: number;
}

export interface YearGameCount {
  year: number;
  year_count: number;
  percentage_year: number;
}

export interface BeatenStatsResponse {
  consoleStats: ConsoleGameCount[];
  genreStats: GenreGameCount[];
  yearStats: YearGameCount[];
}

export interface HighlightGame {
  NameGame: string;
  TimeBeating: number;
  TypeItem: string;
}

export interface ResumedGameItem {
  NameGame: string;
  TimeBeating: number;
  DateBeating?: string;
  Console?: string;
  Genre?: string;
  ReleaseYear?: number;
}

export interface StatsItemDetail {
  highlightGames: HighlightGame[];
  averageTimeBeating: number;
  totalGamesFinished: number;
  totalHoursPlayed: number;
  listGame: ResumedGameItem[];
}

