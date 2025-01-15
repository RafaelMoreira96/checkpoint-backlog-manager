import { Component, OnInit } from '@angular/core';
import { GameService } from '../../../../services/game.service';
import { GenreService } from '../../../../services/genre.service';
import { ConsoleService } from '../../../../services/console.service';
import { Game } from '../../../../models/game';
import { Genre } from '../../../../models/genre';
import { Console } from '../../../../models/console';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-list-missing-data',
  templateUrl: './list-missing-data.component.html',
  styleUrls: ['./list-missing-data.component.css'],
})
export class ListMissingDataComponent implements OnInit {
  games: Game[] = [];
  filteredGames: Game[] = [];
  isLoading: boolean = false;

  genres: Genre[] = [];
  consoles: Console[] = [];

  selectedGenreId: { [key: number]: number } = {};
  selectedConsoleId: { [key: number]: number } = {};

  constructor(
    private gameService: GameService,
    private genreService: GenreService,
    private consoleService: ConsoleService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.getGamesWithMissingData();
    this.loadGenres();
    this.loadConsoles();
  }

  // Carrega os gêneros
  loadGenres(): void {
    this.genreService.getGenres().subscribe({
      next: (data: any) => {
        this.genres = data;
      },
      error: () => {
        this.toast.error('Erro ao carregar gêneros.', 'Erro');
      },
    });
  }

  // Carrega as plataformas
  loadConsoles(): void {
    this.consoleService.getConsoles().subscribe({
      next: (data: any) => {
        this.consoles = data;
      },
      error: () => {
        this.toast.error('Erro ao carregar plataformas.', 'Erro');
      },
    });
  }

  // Atualiza o gênero do jogo
  updateGameGenre(game: Game, genreId: number): void {
    const selectedGenre = this.genres.find(
      (genre) => genre.id_genre === genreId
    );
    if (selectedGenre) {
      game.genre = selectedGenre;
    }
  }

  // Atualiza o console do jogo
  updateGameConsole(game: Game, consoleId: number): void {
    const selectedConsole = this.consoles.find(
      (console) => console.id_console === consoleId
    );
    if (selectedConsole) {
      game.console = selectedConsole;
    }
  }

  getGamesWithMissingData(): void {
    this.isLoading = true;
    this.gameService.getGames().subscribe(
      (result: any) => {
        this.games = result;
        this.filteredGames = this.games.filter(
          (game) =>
            !game.name_game ||
            !game.console?.name_console ||
            !game.genre?.name_genre ||
            !game.developer ||
            !game.release_year ||
            !game.time_beating ||
            game.date_beating === '01/01/0001'
        );

        // Inicializa os IDs selecionados para cada jogo
        this.filteredGames.forEach((game) => {
          this.selectedGenreId[game.id_game] = game.genre?.id_genre ?? 0;
          this.selectedConsoleId[game.id_game] = game.console?.id_console ?? 0;
        });

        this.isLoading = false;
      },
      (error) => {
        this.toast.error('Erro ao carregar os jogos', 'Erro');
        this.isLoading = false;
      }
    );
  }

  saveAllChanges(): void {
    const updatedGames = this.filteredGames.map((game) => ({
      id_game: game.id_game,
      name_game: game.name_game,
      genre_id: game.genre?.id_genre,
      developer: game.developer,
      release_year: game.release_year,
      console_id: game.console?.id_console,
      time_beating: game.time_beating,
      date_beating: game.date_beating,
    }));

    console.log('Jogos atualizados para enviar:', updatedGames);

    this.gameService.updateGames(updatedGames).subscribe(
      () => {
        this.toast.success('Alterações salvas com sucesso!');
        this.getGamesWithMissingData(); // Recarrega os jogos com informações faltando
      },
      (error) => {
        this.toast.error('Erro ao salvar as alterações', 'Erro');
        console.error(error);
      }
    );
  }
}