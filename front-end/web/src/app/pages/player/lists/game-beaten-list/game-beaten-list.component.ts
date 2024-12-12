import { Component, OnInit } from '@angular/core';
import { GameService } from '../../../../services/game.service';
import { Game } from '../../../../models/game';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-game-beaten-list',
  templateUrl: './game-beaten-list.component.html',
  styleUrls: ['./game-beaten-list.component.css'],
})
export class GameBeatenListComponent implements OnInit {
  games: Game[] = [];
  selectedGameId: number | null = null; 

  constructor(
    private service: GameService,
    private router: Router,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.getGames();
  }

  getGames(): void {
    this.service.getGames().subscribe(
      (result: any) => {
        this.games = result;
      },
      (error) => {
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
    this.router.navigate(['register-game', game.id_game]);
  }
}
