import { Component, OnInit } from '@angular/core';
import { BacklogService } from '../../../../services/backlog.service';
import { Game } from '../../../../models/game';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-backlog-list',
  templateUrl: './backlog-list.component.html',
  styleUrl: './backlog-list.component.css',
})
export class BacklogListComponent implements OnInit {
  games: Game[] = [];
  selectedGameId: number | null = null;

  constructor(
    private service: BacklogService, 
    private router: Router,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
      this.getGames();
  }

  getGames() {
    this.service.getBacklog().subscribe(
      (result: any) => {
        this.games = result;
      },
      (ex) => {
        this.toast.error('Erro ao carregar os jogos', 'Erro');
      }
    );
  }

  openModal(id: number): void {
    this.selectedGameId = id; 
  }

  confirmDelete(): void {
    if (this.selectedGameId !== null) {
      this.service.deleteGame(this.selectedGameId).subscribe(
        () => {
          this.toast.success('Jogo removido com sucesso');
          this.getGames();
          this.selectedGameId = null;
        },
        (error) => {
          this.toast.error('Erro ao remover o jogo', 'Erro');
          console.error(error);
        }
      );
    }
  }

  editGame(game: Game): void {
    this.router.navigate(['register-backlog', game.id_game]);
  }

  beatedGame(game: Game): void {
    this.router.navigate(['register-game', game.id_game]);
  }
}
