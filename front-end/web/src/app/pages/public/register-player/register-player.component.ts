import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Player } from '../../../models/player';
import { PlayerService } from '../../../services/player.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register-player',
  templateUrl: './register-player.component.html',
  styleUrl: './register-player.component.css',
})
export class RegisterPlayerComponent {
  player: Player = new Player();
  confirmPassword: string | undefined;

  constructor(
    private router: Router,
    private service: PlayerService,
    private toastr: ToastrService
  ) {}

  backToIndex() {
    this.router.navigate(['/']);
  }

  registerPlayer() {
    this.service.registerPlayer(this.player).subscribe(
      () => {
        this.toastr.success('Jogador registrado com sucesso!', 'Sucesso');
        this.router.navigate(['/login']);
      },
      (error) => {
        this.toastr.error('Erro ao registrar jogador.', 'Erro');
      }
    );
  }
}
