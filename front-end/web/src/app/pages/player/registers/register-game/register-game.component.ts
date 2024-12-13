import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConsoleService } from '../../../../services/console.service';
import { GenreService } from '../../../../services/genre.service';
import { GameService } from '../../../../services/game.service';
import { Game } from '../../../../models/game';
import { Genre } from '../../../../models/genre';
import { Console } from '../../../../models/console';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-register-game',
  templateUrl: './register-game.component.html',
  styleUrls: ['./register-game.component.css'],
})
export class RegisterGameComponent implements OnInit {
  game: Game = new Game();
  isEditing: boolean = false;

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
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
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
    this.gameService.getGame(id).subscribe(
      (data: any) => {
        this.game = data;
        this.nameGame = this.game.name_game;
        this.developer = this.game.developer;
        this.selectedConsole = this.game.console_id;
        this.selectedGenre = this.game.genre_id;
        this.dateBeating = this.game.date_beating;
        this.timeBeating = this.game.time_beating;
        this.releaseYear = this.game.release_year;
        this.game.status = 0;
      },
      (error) => {
        this.toastr.error('Erro ao carregar os dados do jogo.', 'Erro');
      }
    );
  }

  loadConsoles(): void {
    this.consoleService.getConsoles().subscribe({
      next: (data: any) => {
        this.consoles = data;
      },
      error: (error) => {
        this.toastr.error('Erro ao carregar consoles.', 'Erro');
      },
    });
  }

  loadGenres(): void {
    this.genreService.getGenres().subscribe({
      next: (data: any) => {
        this.genres = data;
      },
      error: (error) => {
        this.toastr.error('Erro ao carregar gêneros.', 'Erro');
      },
    });
  }

  registerGame(): void {
    if (this.isEditing) {
      this.updateGame();
    } else {
      this.createGame();
    }
    this.router.navigate(['/game-beaten-list']);
  }

  createGame(): void {
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
      updated_at: new Date(),
    };

    this.gameService.registerGame(this.game).subscribe({
      next: (response) => {
        this.toastr.success('Jogo cadastrado com sucesso!', 'Sucesso');
      },
      error: (error) => {
        this.toastr.error('Erro ao cadastrar jogo.', 'Erro');
      },
    });
  }

  updateGame(): void {
    this.game.name_game = this.nameGame;
    this.game.developer = this.developer;
    this.game.console_id = Number(this.selectedConsole) ?? 0;
    this.game.genre_id = Number(this.selectedGenre) ?? 0;
    this.game.date_beating = this.dateBeating ?? '';
    this.game.time_beating = Number(this.timeBeating);
    this.game.release_year = this.releaseYear ?? '';

    this.gameService.updateGame(this.game.id_game, this.game).subscribe({
      next: (response) => {
        this.toastr.success('Jogo atualizado com sucesso!', 'Sucesso');
      },
      error: (error) => {
        this.toastr.error('Erro ao atualizar jogo.', 'Erro');
      },
    });
  }
}
