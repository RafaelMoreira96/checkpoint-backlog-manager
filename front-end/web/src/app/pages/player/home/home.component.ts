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
  icon: string;
  colorIcon: string;
  title: string;
  data: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  cardsInfo: CardInfo[] = [];
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

  loadCardsInfo(): void {
    this.service.getPreferedAndUnpreferedGenre().subscribe(
      (result: any) => {
        this.cardsInfo = [
          {
            colorIcon: 'success',
            icon: 'fas fa-gamepad',
            title: 'Total de jogos zerados',
            data:
              result.total_games_finished?.toString() + ' jogos' || 'N/A',
          },
          {
            colorIcon: 'success',
            icon: 'icon-game-controller',
            title: 'Jogos zerados neste mês',
            data:
              result.games_finished_this_month?.toString() + ' jogos' || 'N/A',
          },
          {
            colorIcon: 'danger',
            icon: 'far fa-clock',
            title: 'Tempo total (no mês)',
            data:
              result.total_hours_played_this_month.toString() + ' horas' ||
              'N/A',
          },
          {
            colorIcon: 'info',
            icon: 'fas fa-clock',
            title: 'Tempo total',
            data: result.total_hours_played?.toString() + ' horas' || 'N/A',
          },
          {
            colorIcon: 'warning',
            icon: 'fas fa-star',
            title: 'Gênero preferido',
            data: result.most_used || 'N/A',
          },
          {
            colorIcon: 'secondary',
            icon: 'fas fa-star-half-alt',
            title: '2º Gênero preferido',
            data: result.second_most_used || 'N/A',
          },
          {
            colorIcon: 'primary',
            icon: 'far fa-star',
            title: 'Gênero preterido',
            data: result.least_used || 'N/A',
          },
        ];
      },
      (error) => {
        console.error('Failed to load genre information:', error);
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
