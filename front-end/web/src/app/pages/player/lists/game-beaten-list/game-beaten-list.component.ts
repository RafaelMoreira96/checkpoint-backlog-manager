import { ChangeDetectorRef, Component, OnChanges, OnInit } from '@angular/core';
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
  filteredGames: Game[] = []; // Lista filtrada
  searchTerm: string = ''; // Termo de busca
  selectedGameId: number | null = null;
  currentPage: number = 1;
  pageSize: number = 24;
  totalGames: number = 0; // Para calcular o total de páginas
  isLoading: boolean = false;
  isCardView: boolean = true; 

  constructor(
    private service: GameService,
    private router: Router,
    private toast: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getGames();
  }

  toggleViewMode(): void {
    this.isCardView = !this.isCardView;
  }

  getGames(): void {
    this.isLoading = true;
    const timestamp = new Date().getTime(); 
    this.service.getGames().subscribe(
      (result: any) => {
        this.games = result;
        this.filteredGames = result; 
        this.totalGames = this.filteredGames.length;
        this.isLoading = false;
        this.cdr.detectChanges();
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

  // Método de filtragem
  filterGames(): void {
    const lowerCaseSearch = this.searchTerm.toLowerCase();
    this.filteredGames = this.games.filter((game) => 
      game.name_game.toLowerCase().includes(lowerCaseSearch) ||
      (game.console?.name_console?.toLowerCase() || '').includes(lowerCaseSearch) ||
      (game.genre?.name_genre?.toLowerCase() || '').includes(lowerCaseSearch)
    );
    this.totalGames = this.filteredGames.length; // Atualiza o total de jogos após filtragem
    this.currentPage = 1; // Reseta a paginação
  }

  get paginatedGames(): Game[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredGames.slice(startIndex, startIndex + this.pageSize);
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
