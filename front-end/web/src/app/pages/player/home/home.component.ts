import { Component, OnInit } from '@angular/core';
import { FrontendHomePlayerService } from '../../../services/frontend-home-player.service';

export interface InfoGame {
  id_game?: number;
  name_game: string;
  genre: string;
  console: string;
  time_beating?: string;
  date_beating?: string;
  url_image?: string;
  release_year?: number;
}

export interface CardInfo {
  icon: string;
  colorClass: string;
  title: string;
  data: string;
  subtitle?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  cardsInfo: CardInfo[] = [];
  beating_list: InfoGame[] = [];
  backlog_list: InfoGame[] = [];
  isLoading: boolean = true;

  constructor(private service: FrontendHomePlayerService) {}

  ngOnInit(): void {
    this.lastGamesBeaten();
    this.loadCardsInfo();
    this.loadBacklog();
  }

  lastGamesBeaten() {
    this.service.lastGamesBeaten().subscribe(
      (result: any) => {
        this.beating_list = [];
        if (Array.isArray(result)) {
          for (let i = 0; i < result.length; i++) {
            this.beating_list.push({
              id_game: result[i].id_game,
              name_game: result[i].name_game,
              genre: result[i].genre?.name_genre || 'Gênero n/a',
              console: result[i].console?.name_console || 'Plataforma n/a',
              time_beating: result[i].time_beating ? Number(result[i].time_beating).toFixed(1) : undefined,
              date_beating: result[i].date_beating,
              url_image: result[i].url_image,
              release_year: result[i].release_year,
            });
          }
        }
        this.isLoading = false;
      },
      (ex) => {
        console.error(ex);
        this.isLoading = false;
      }
    );
  }

  loadCardsInfo(): void {
    this.service.getPreferedAndUnpreferedGenre().subscribe(
      (result: any) => {
        this.cardsInfo = [
          {
            colorClass: 'metric-icon-emerald',
            icon: 'fas fa-trophy',
            title: 'Total Zerados',
            data: result.total_games_finished ? `${result.total_games_finished} jogos` : '0 jogos',
            subtitle: 'Conquistas registradas'
          },
          {
            colorClass: 'metric-icon-cyan',
            icon: 'fas fa-calendar-check',
            title: 'Zerados este Mês',
            data: result.games_finished_this_month ? `${result.games_finished_this_month} jogos` : '0 jogos',
            subtitle: 'Ritmo mensal'
          },
          {
            colorClass: 'metric-icon-violet',
            icon: 'fas fa-clock',
            title: 'Horas no Mês',
            data: result.total_hours_played_this_month ? `${Number(result.total_hours_played_this_month).toFixed(1)}h` : '0h',
            subtitle: 'Tempo dedicado no mês'
          },
          {
            colorClass: 'metric-icon-amber',
            icon: 'fas fa-stopwatch',
            title: 'Tempo Total Jogado',
            data: result.total_hours_played ? `${Number(result.total_hours_played).toFixed(1)}h` : '0h',
            subtitle: 'Horas totais registradas'
          },
          {
            colorClass: 'metric-icon-violet',
            icon: 'fas fa-crown',
            title: 'Gênero Favorito',
            data: result.most_used || 'N/A',
            subtitle: 'Mais jogado na carreira'
          },
          {
            colorClass: 'metric-icon-rose',
            icon: 'fas fa-compass',
            title: '2º Favorito',
            data: result.second_most_used || 'N/A',
            subtitle: 'Gênero em ascensão'
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
        this.backlog_list = [];
        if (Array.isArray(result)) {
          for (let i = 0; i < result.length; i++) {
            this.backlog_list.push({
              id_game: result[i].id_game,
              name_game: result[i].name_game,
              genre: result[i].genre?.name_genre || 'Gênero n/a',
              console: result[i].console?.name_console || 'Plataforma n/a',
              url_image: result[i].url_image,
              release_year: result[i].release_year,
            });
          }
        }
      },
      (ex) => {
        console.error(ex);
      }
    );
  }
}
