import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConsoleService } from '../../../../services/console.service';
import { GenreService } from '../../../../services/genre.service';
import { GameService } from '../../../../services/game.service';
import { Game } from '../../../../models/game';
import { Genre } from '../../../../models/genre';
import { Console } from '../../../../models/console';

@Component({
  selector: 'app-register-game',
  templateUrl: './register-game.component.html',
  styleUrls: ['./register-game.component.css']
})
export class RegisterGameComponent implements OnInit {
  game: Game = new Game();

  nameGame: string = '';
  developer: string = '';
  selectedConsole: number | undefined;
  selectedGenre: number | undefined;
  dateBeating: string | undefined;
  timeBeating: number | undefined;
  releaseYear: string | undefined;
  consoles: Console[] = [];
  genres: Genre[] = [];

  constructor(
    private consoleService: ConsoleService,
    private genreService: GenreService,
    private gameService: GameService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadConsoles();
    this.loadGenres();
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

  registerGame(): void {
    this.game = {
      id_game: 0, 
      name_game: this.nameGame,
      developer: this.developer,
      console_id: Number(this.selectedConsole) ?? 0,
      genre_id: Number(this.selectedGenre) ?? 0,
      date_beating: this.dateBeating ?? '',
      time_beating: this.timeBeating ?? 0, 
      release_year: this.releaseYear ?? '',
      status: 0,
      player_id: 0,
      created_at: new Date(), 
      updated_at: new Date() 
    };

    this.gameService.registerGame(this.game).subscribe({
      next: (response) => {
        this.toastr.success('Jogo cadastrado com sucesso!', 'Sucesso');
      },
      error: (error) => {
        this.toastr.error('Erro ao cadastrar jogo.', 'Erro');
      }
    });
  }
}
