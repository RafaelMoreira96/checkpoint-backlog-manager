import { Component, OnInit } from '@angular/core';
import { BacklogService } from '../../../../services/backlog.service';
import { Game } from '../../../../models/game';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-backlog-list',
  templateUrl: './backlog-list.component.html',
  styleUrls: ['./backlog-list.component.css'],
})
export class BacklogListComponent implements OnInit {
  games: Game[] = [];
  filteredGames: Game[] = [];
  paginatedGames: Game[] = [];
  searchTerm: string = '';
  selectedGameId: number | null = null;
  isCardView: boolean = true;
  isLoading: boolean = false;
  currentPage: number = 1;
  pageSize: number = 12;
  totalPages: number = 1;

  constructor(
    private service: BacklogService,
    private router: Router,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.getGames();
  }

  getGames(): void {
    this.isLoading = true;
    this.service.getBacklog().subscribe(
      (result: any) => {
        this.games = result;
        this.filteredGames = [...this.games]; 
        this.updatePagination();
        this.isLoading = false; 
      },
      (error) => {
        this.toast.error('Erro ao carregar os jogos', 'Erro');
        console.error(error);
        this.isLoading = false; 
      }
    );
  }

  filterGames(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredGames = this.games.filter((game) => {
      return (
        game.name_game.toLowerCase().includes(term) ||
        (game.genre?.name_genre?.toLowerCase().includes(term) ?? false) ||
        (game.console?.name_console?.toLowerCase().includes(term) ?? false)
      );
    });
    this.updatePagination();
  }

  toggleViewMode(): void {
    this.isCardView = !this.isCardView;
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredGames.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedGames = this.filteredGames.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  openModal(id: number): void {
    this.selectedGameId = id;
  }

  confirmDelete(): void {
    if (this.selectedGameId !== null) {
      this.service.deleteGame(this.selectedGameId).subscribe(
        () => {
          this.toast.success('Jogo removido com sucesso');
          this.getGames(); // 
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
