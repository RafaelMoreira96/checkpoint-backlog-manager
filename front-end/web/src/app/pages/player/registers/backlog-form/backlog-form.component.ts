import { Component } from '@angular/core';
import { Game } from '../../../../models/game';
import { Genre } from '../../../../models/genre';
import { Console } from '../../../../models/console';
import { ConsoleService } from '../../../../services/console.service';
import { GenreService } from '../../../../services/genre.service';
import { ToastrService } from 'ngx-toastr';
import { BacklogService } from '../../../../services/backlog.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiIgdbService } from '../../../../services/api-igdb.service';

export interface GameFromIGDBService {
  id: number;
  name: string;
  developer: string;
  url_image: string;
  release_year: number;
}

@Component({
  selector: 'app-backlog-form',
  templateUrl: './backlog-form.component.html',
  styleUrls: ['./backlog-form.component.css']
})
export class BacklogFormComponent {
  game: Game = new Game();
  isEditing: boolean = false;

  nameGame: string = '';
  developer: string = '';
  url_image: string = '';
  selectedConsole: number | undefined;
  selectedGenre: number | undefined;
  dateBeating: string | undefined;
  timeBeating: number | undefined;
  releaseYear: number | undefined;
  consoles: Console[] = [];
  genres: Genre[] = [];
  
  // Para IGDB
  igdb_game_search: string = '';
  searchResults: any[] = [];
  loadingSearch: boolean = false;

  constructor(
    private consoleService: ConsoleService,
    private genreService: GenreService,
    private backlogService: BacklogService,
    private apiIgdbService: ApiIgdbService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const idGame = this.route.snapshot.paramMap.get('id_game');
    if (idGame) {
      this.isEditing = true;
      this.getGame(+idGame);
    }
    this.loadConsoles();
    this.loadGenres();
  }

  getGame(id: number): void {
    this.backlogService.getBacklogById(id).subscribe({
      next: (data: any) => {
        this.game = data;
        this.nameGame = this.game.name_game;
        this.developer = this.game.developer;
        this.url_image = this.game.url_image;
        this.selectedConsole = this.game.console_id;
        this.selectedGenre = this.game.genre_id;
        this.dateBeating = this.game.date_beating;
        this.timeBeating = this.game.time_beating;
        this.releaseYear = this.game.release_year;
      },
      error: (error) => {
        this.toastr.error('Erro ao carregar jogo.', 'Erro');
      }
    });
  }

  loadConsoles(): void {
    this.consoleService.getConsoles().subscribe({
      next: (data: any) => {
        this.consoles = data;
      },
      error: (error) => {
        this.toastr.error('Erro ao carregar consoles.', 'Erro');
      }
    });
  }

  loadGenres(): void {
    this.genreService.getGenres().subscribe({
      next: (data: any) => {
        this.genres = data;
      },
      error: (error) => {
        this.toastr.error('Erro ao carregar gêneros.', 'Erro');
      }
    });
  }

  // Método para buscar o jogo na IGDB
  searchGameFromIGDB(): void {
    if (!this.igdb_game_search.trim()) return;

    this.loadingSearch = true;
    this.apiIgdbService.searchGames(this.igdb_game_search).subscribe({
      next: (result: GameFromIGDBService[]) => {
        this.searchResults = result;
        this.loadingSearch = false;
        this.igdb_game_search = '';
      },
      error: () => {
        this.toastr.error('Erro ao buscar jogos no catálogo.', 'Erro');
        this.loadingSearch = false;
      },
    });
  }

 selectGameFromSearch(game: GameFromIGDBService): void {
     this.nameGame = game.name;
     this.releaseYear = game.release_year;
     this.developer = game.developer;
     this.url_image = game.url_image;
     this.toastr.info(`Jogo "${game.name}" selecionado.`, 'Informação');
   }

  registerGame(): void {
    if (this.isEditing) {
      this.updateGame();
    } else {
      this.createGame();
    }
    this.router.navigate(['/backlog-list']);
  }

  createGame(): void {
    this.game = {
      id_game: 0, 
      name_game: this.nameGame,
      url_image: this.url_image,
      developer: this.developer,
      console_id: Number(this.selectedConsole) ?? 0,
      genre_id: Number(this.selectedGenre) ?? 0,
      date_beating: this.dateBeating ?? '2001-01-01',
      time_beating: this.timeBeating ?? 0, 
      release_year: this.releaseYear ?? 0,
      status: 1,
      player_id: 0,
      created_at: new Date(), 
      updated_at: new Date() 
    };

    this.backlogService.postBacklog(this.game).subscribe({
      next: (response) => {
        this.toastr.success('Jogo cadastrado com sucesso!', 'Sucesso');
        this.router.navigate(['/backlog-list']);
      },
      error: (error) => {
        this.toastr.error('Erro ao cadastrar jogo.', 'Erro');
      }
    });
  }

  updateGame(): void {
    this.game = {
      id_game: this.game.id_game,
      name_game: this.nameGame,
      url_image: this.game.url_image,
      developer: this.developer,
      console_id: Number(this.selectedConsole) ?? 0,
      genre_id: Number(this.selectedGenre) ?? 0,
      date_beating: this.dateBeating ?? '2001-01-01',
      time_beating: this.timeBeating ?? 0,
      release_year: this.releaseYear ?? 0,
      status: 1,
      player_id: 0,
      created_at: this.game.created_at,
      updated_at: new Date()
    };

    this.backlogService.updateGame(this.game.id_game, this.game).subscribe({
      next: (response) => {
        this.toastr.success('Jogo atualizado com sucesso!', 'Sucesso');
        this.router.navigate(['/backlog-list']);
      },
      error: (error) => {
        this.toastr.error('Erro ao atualizar jogo.', 'Erro');
      }
    });
  }

  isFormValid(): boolean {
    return (
      this.nameGame.trim() !== ''
    );
  }
}
