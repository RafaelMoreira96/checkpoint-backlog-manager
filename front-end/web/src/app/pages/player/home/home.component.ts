import { Component } from '@angular/core';
import { FrontendHomePlayerService } from '../../../services/frontend-home-player.service';

interface InfoGame {
  name_game: string;
  genre: string;
  console: string;
  time_beating?: string;
  date_beating?: string;
}

interface CardInfo {
  second_played_genre_used: string;
  most_played_genre: number;
  least_played_genre: number;
  games_finished_this_month: number;
  total_hours_played: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  cardsInfo: CardInfo = {
    second_played_genre_used: 'N/A',
    most_played_genre: 0,
    least_played_genre: 0,
    games_finished_this_month: 0,
    total_hours_played: 0,
  };
  beating_list: InfoGame[] = [];
  backlog_list: InfoGame[] = [];

  constructor(private service: FrontendHomePlayerService) {}

  ngOnInit(): void {
    this.lastGamesBeaten();
    this.loadCardsInfo();
    this.loadBacklog();
  }

  lastGamesBeaten() {
    this.service.lastGamesBeaten().subscribe(
      (result: any) => {
        for (let i = 0; i < result.length; i++) {
          this.beating_list.push({
            name_game: result[i].name_game,
            genre: result[i].genre.name_genre,
            console: result[i].console.name_console,
            time_beating: result[i].time_beating,
            date_beating: result[i].date_beating,
          });
        }
      },
      (ex) => {
        console.log(ex);
      }
    );
  }

  loadCardsInfo() {
    this.service.getPreferedAndUnpreferedGenre().subscribe(
      (result: any) => {
        if (this.cardsInfo) {
          this.cardsInfo.most_played_genre = result.most_used || 'N/A';
          this.cardsInfo.second_played_genre_used =
            result.second_most_used || 'N/A';
          this.cardsInfo.least_played_genre = result.least_used || 'N/A';
          this.cardsInfo.games_finished_this_month =
            result.games_finished_this_month || 0;
          this.cardsInfo.total_hours_played = result.total_hours_played || 0;
        } else {
          console.error('cardsInfo is not initialized');
        }
        console.log('cardsInfo:', this.cardsInfo);
        console.log(result);
      },
      (error) => {
        console.error('Failed to load genre information', error);
      }
    );
  }

  loadBacklog() {
    this.service.loadBacklog().subscribe(
      (result: any) => {
        for (let i = 0; i < result.length; i++) {
          this.backlog_list.push({
            name_game: result[i].name_game,
            genre: result[i].genre.name_genre,
            console: result[i].console.name_console,
          });
        }
      },
      (ex) => {
        console.log(ex);
      }
    );
  }
}
