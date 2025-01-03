import { Console } from "./console";
import { Genre } from "./genre";

export class Game {
  id_game: number;
  name_game: string;
  url_image: string;
  developer: string;
  genre_id: number;
  genre?: Genre;
  console_id: number;
  console?: Console;   
  date_beating: string;
  time_beating: number;
  release_year: string;
  status: number;
  player_id: number;
  created_at: Date;
  updated_at: Date;

  constructor() {
    this.id_game = 0;
    this.name_game = '';
    this.url_image = '';
    this.developer = '';
    this.genre_id = 0;
    this.genre = new Genre; 
    this.console_id = 0;
    this.console = new Console;
    this.date_beating = '';
    this.time_beating = 0;
    this.release_year = '';
    this.status = 0;
    this.player_id = 0;
    this.created_at = new Date();
    this.updated_at = new Date();
  }
}
