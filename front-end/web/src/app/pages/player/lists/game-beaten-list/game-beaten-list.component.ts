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
  currentPage: number = 1;
  pageSize: number = 25;
  totalGames: number = 0; // Para calcular o total de páginas
  isLoading: boolean = false;

  constructor(
    private service: GameService,
    private router: Router,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.getGames();
  }

  getGames(): void {
    this.isLoading = true;
    this.service.getGames().subscribe(
      (result: any) => {
        this.games = result;
        this.totalGames = this.games.length;
        this.isLoading = false;
      },
      (error) => {
        this.toast.error('Erro ao carregar os jogos', 'Erro');
        this.isLoading = false;
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

  get paginatedGames(): Game[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.games.slice(startIndex, startIndex + this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage * this.pageSize < this.totalGames) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalGames / this.pageSize);
  }
}
