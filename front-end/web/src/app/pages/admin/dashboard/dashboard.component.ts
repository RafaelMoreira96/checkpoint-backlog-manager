import { Component, OnInit } from '@angular/core';
import { FrontendDashboardAdminService } from '../../../services/frontend-dashboard-admin.service';

interface PlayerInfo {
  name_player: string;
  nickname: string;
  created_at: string;
}

interface AdminInfo {
  name_administrator: string;
  nickname: string;
  created_at: string;
}

interface CardInfo {
  icon: string;
  colorIcon: string;
  title: string;
  data: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  lastPlayersAdded: PlayerInfo[] = [];
  lastAdminsAdded: AdminInfo[] = [];
  cardsAdminInfo: CardInfo[] = [];

  constructor(private service: FrontendDashboardAdminService) {}

  ngOnInit(): void {
    this.getFiveLastPlayersAdded();
    this.getFiveLastAdminsAdded();
    this.loadCardsInfo();
  }

  getFiveLastPlayersAdded(): void {
    this.service.getFiveLastPlayersAdded().subscribe(
      (result: any) => {
        for (let i = 0; i < result.length; i++) {
          this.lastPlayersAdded.push({
            name_player: result[i].name_player,
            nickname: result[i].nickname,
            created_at: result[i].created_at,
          });
        }
        console.log(this.lastPlayersAdded);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getFiveLastAdminsAdded(): void {
    this.service.getFiveLastAdminsAdded().subscribe(
      (result: any) => {
        for (let i = 0; i < result.length; i++) {
          this.lastAdminsAdded.push({
            name_administrator: result[i].name_administrator,
            nickname: result[i].nickname,
            created_at: result[i].created_at,
          });
        }
      },
      (error) => {
        console.error('Error fetching the last 5 admins added:', error);
      }
    );
  }

  loadCardsInfo(): void {
    this.service.cardsInfo().subscribe(
      (result: any) => {
        this.cardsAdminInfo = [
          {
            icon: 'fas fa-users',
            colorIcon: 'primary',
            title: 'Administradores registrados ativos',
            data: result.total_administrators,
          },
          {
            icon: 'icon-people',
            colorIcon: 'warning',
            title: 'Jogadores registrados ativos',
            data: result.total_players,
          },
          {
            icon: 'fas fa-flag-checkered',
            colorIcon: 'info',
            title: 'Jogos zerados cadastrados',
            data: result.total_games,
          },
          {
            icon: 'fas fa-indent',
            colorIcon: 'secondary',
            title: 'Gêneros cadastrados',
            data: result.total_genres,
          },
          {
            icon: 'fas fa-gamepad',
            colorIcon: 'success',
            title: 'Consoles cadastrados',
            data: result.total_consoles,
          },
          {
            icon: 'fas fa-building',
            colorIcon: 'danger',
            title: 'Fabricantes cadastrados',
            data: result.total_manufacturers,
          }
        ];
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
