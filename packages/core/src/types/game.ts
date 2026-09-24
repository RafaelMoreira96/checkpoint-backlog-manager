import { Console, Genre } from './catalog';

export interface Game {
  id_game: number;
  name_game: string;
  genre_id: number;
  genre?: Genre;
  developer?: string;
  release_year?: number;
  console_id: number;
  console?: Console;
  time_beating?: number;
  date_beating?: string;
  url_image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateGameDto {
  name_game: string;
  genre_id: number;
  developer?: string;
  release_year?: number;
  console_id: number;
  time_beating?: number;
  date_beating?: string;
  url_image?: string;
}

export interface UpdateGameDto extends Partial<CreateGameDto> {
  id_game: number;
}
