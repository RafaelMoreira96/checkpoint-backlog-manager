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
  totalPages: number = 1;

  constructor(private statsService: GamisticStatisticsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['itemId'] && this.itemId) || (changes['itemType'] && this.itemType) || (changes['descriptionItem'] && this.descriptionItem)){
      this.loadStats(this.itemId, this.itemType);
    }
  }

  loadStats(itemId: number, itemType: string): void {
    this.isLoading = true;
    this.statsService.getBeatenStatsByItem(itemId, itemType).subscribe({
      next: (data) => {
        this.statsData = data;
        this.updatePaginatedGames(); 
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar dados:', err);
        this.isLoading = false;
      },
    });
  }

  updatePaginatedGames(): void {
    if (this.statsData && this.statsData.listGame) {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.paginatedGames = this.statsData.listGame.slice(startIndex, endIndex);
      this.totalPages = Math.ceil(this.statsData.listGame.length / this.itemsPerPage);
    }
  }

  changePage(direction: number): void {
    this.currentPage += direction;
    this.updatePaginatedGames();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedGames();
  }

  getPages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}