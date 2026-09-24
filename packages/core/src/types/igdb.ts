export interface IGDBGameResult {
  id: number;
  name: string;
  cover_url?: string;
  first_release_date?: number;
  release_year?: number;
  summary?: string;
  developer?: string;
  genres?: string[];
  platforms?: string[];
}
