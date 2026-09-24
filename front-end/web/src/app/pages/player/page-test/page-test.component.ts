import { Component } from '@angular/core';
import { ApiIgdbService } from '../../../services/api-igdb.service';
import { Game } from '../../../models/game';

export interface GameFromIGDBService {
  id: number;
  name: string;
  developer: string;
  url_image: string;
  release_year: number;
}

@Component({
  selector: 'app-page-test',
  templateUrl: './page-test.component.html',
  styleUrls: ['./page-test.component.css'],
})
export class PageTestComponent {
  game: Game = new Game();

  name_game: string = '';
  results_game: GameFromIGDBService[] = [];
  loading = false;

  constructor(private service: ApiIgdbService) {}

  searchFunction() {
    if (!this.name_game.trim()) return;

    this.loading = true;
    this.service.searchGames(this.name_game).subscribe({
      next: (result: GameFromIGDBService[]) => {
        this.results_game = result;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching games:', error);
        this.loading = false;
      },
    });
  }

  createGameRegisterFunction() {
    throw new Error('Method not implemented.');
  }

  getYearFromUnix(unixTimestamp: number | null): string {
    if (!unixTimestamp || isNaN(unixTimestamp)) {
      return 'Sem data';
    }

    const date = new Date(unixTimestamp * 1000);
    return date.getFullYear().toString();
  }
}
