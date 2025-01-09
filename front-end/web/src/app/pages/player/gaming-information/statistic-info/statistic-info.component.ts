import { Component, OnInit } from '@angular/core';
import { GamisticStatisticsService } from '../../../../services/gamistic-statistics.service';
import { ConsoleGameCount } from '../../../../models/game-count/console-game-count';
import { GenreGameCount } from '../../../../models/game-count/genre-game-count';
import { YearGameCount } from '../../../../models/game-count/year-game-count';

@Component({
  selector: 'app-statistic-info',
  templateUrl: './statistic-info.component.html',
  styleUrls: ['./statistic-info.component.css'],
})
export class StatisticInfoComponent implements OnInit {
  consoleStats: ConsoleGameCount[] = [];
  genresStats: GenreGameCount[] = [];
  yearsStats: YearGameCount[] = [];

  genrePage: number = 1;
  yearPage: number = 1;
  consolePage: number = 1;
  itemsPerPage: number = 8;
  paginatedGenres: GenreGameCount[] = [];
  paginatedYears: YearGameCount[] = [];
  paginatedConsoles: ConsoleGameCount[] = [];
  totalGenrePages: number = 1;
  totalYearPages: number = 1;
  totalConsolePages: number = 1;

  constructor(private service: GamisticStatisticsService) {}

  ngOnInit() {
    this.beatenStats();
  }

  beatenStats() {
    this.service.getBeatenStats().subscribe((response: any) => {
      this.consoleStats = response.consoleStats.filter(
        (console: any) => console.game_count !== 0
      );

      this.genresStats = response.genreStats.filter(
        (genre: any) => genre.genre_count !== 0
      );

      this.yearsStats = response.yearStats.filter(
        (year: any) => year.year_count !== 0
      );

      this.calculatePages();
      this.updatePaginatedItems();
    });
  }

  calculatePages(): void {
    this.totalGenrePages = Math.ceil(
      this.genresStats.length / this.itemsPerPage
    );
    this.totalYearPages = Math.ceil(this.yearsStats.length / this.itemsPerPage);
    this.totalConsolePages = Math.ceil(
      this.consoleStats.length / this.itemsPerPage
    );
  }

  updatePaginatedItems(): void {
    const startGenre = (this.genrePage - 1) * this.itemsPerPage;
    const startYear = (this.yearPage - 1) * this.itemsPerPage;
    const startConsole = (this.consolePage - 1) * this.itemsPerPage;

    this.paginatedGenres = this.genresStats.slice(
      startGenre,
      startGenre + this.itemsPerPage
    );
    this.paginatedYears = this.yearsStats.slice(
      startYear,
      startYear + this.itemsPerPage
    );
    this.paginatedConsoles = this.consoleStats.slice(
      startConsole,
      startConsole + this.itemsPerPage
    );
  }

  changePage(type: 'genre' | 'year' | 'console', direction: number): void {
    if (type === 'genre') {
      this.genrePage += direction;
    } else if (type === 'year') {
      this.yearPage += direction;
    } else if (type === 'console') {
      this.consolePage += direction;
    }
    this.updatePaginatedItems();
  }
}
