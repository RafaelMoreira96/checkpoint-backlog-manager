import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { GamisticStatisticsService } from '../../../../services/gamistic-statistics.service';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.css'],
})
export class ItemDetailsComponent implements OnChanges {
  @Input() itemId!: number; // ID do item (gênero, plataforma, ano, etc.)
  @Input() itemType!: string; // Tipo do item (genre, platform, year, etc.)
  @Input() descriptionItem!: string; // Descrição do item (nome do gênero, plataforma, ano, etc.)
  statsData: any = [];
  isLoading: boolean = true;

  currentPage: number = 1;
  itemsPerPage: number = 12;
  paginatedGames: any[] = [];
  filteredGames: any[] = []; // Lista filtrada de jogos
  totalPages: number = 1;
  searchTerm: string = ''; // Termo de busca

  constructor(private statsService: GamisticStatisticsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['itemId'] && this.itemId) ||
      (changes['itemType'] && this.itemType) ||
      (changes['descriptionItem'] && this.descriptionItem)
    ) {
      this.loadStats(this.itemId, this.itemType);
    }
  }

  loadStats(itemId: number, itemType: string): void {
    this.isLoading = true;
    this.statsService.getBeatenStatsByItem(itemId, itemType).subscribe({
      next: (data) => {
        this.statsData = data;
        this.filteredGames = this.statsData.listGame; // Inicializa a lista filtrada com todos os jogos
        this.updatePaginatedGames();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar dados:', err);
        this.isLoading = false;
      },
    });
  }

  // Método para filtrar os jogos com base no termo de busca
  filterGames(): void {
    if (!this.searchTerm) {
      this.filteredGames = this.statsData.listGame; // Se não houver termo de busca, mostra todos os jogos
    } else {
      const lowerCaseSearch = this.searchTerm.toLowerCase();
      this.filteredGames = this.statsData.listGame.filter((game: { NameGame: string; }) =>
        game.NameGame.toLowerCase().includes(lowerCaseSearch)
      );
    }
    this.currentPage = 1; // Reseta a paginação para a primeira página
    this.updatePaginatedGames(); // Atualiza a lista paginada
  }

  // Método para atualizar a lista paginada
  updatePaginatedGames(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedGames = this.filteredGames.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.filteredGames.length / this.itemsPerPage);
  }

  // Método para mudar de página
  changePage(direction: number): void {
    this.currentPage += direction;
    this.updatePaginatedGames();
  }

  // Método para ir para uma página específica
  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedGames();
  }

  // Método para obter as páginas disponíveis
  getPages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}