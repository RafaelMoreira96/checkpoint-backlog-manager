export interface IGDBGenreItem {
  id: number;
  name: string;
  slug: string;
}

export interface IGDBGameResult {
  id: number;
  name: string;
  cover_url?: string;
  url_image?: string;
  first_release_date?: number;
  release_year?: number;
  summary?: string;
  developer?: string;
  genres?: IGDBGenreItem[] | string[];
  genre_id?: number;
  genre_name?: string;
  platforms?: string[];
}

