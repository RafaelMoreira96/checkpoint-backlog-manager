import { Component, OnInit } from '@angular/core';
import { Player } from '../../../models/player';
import { PlayerService } from '../../../services/player.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-player-profile',
  templateUrl: './player-profile.component.html',
  styleUrl: './player-profile.component.css',
})
export class PlayerProfileComponent implements OnInit {
  profile: Player = new Player();
  isEditing: boolean = false;
  finishedGames: number = 0;
  backlogGames: number = 0;

  constructor(
    private service: PlayerService,
    private toast: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getProfile();
  }

  getProfile() {
    this.service.viewPlayer().subscribe(
      (result: any) => {
        console.log(result);
        this.profile = result.player;
        this.finishedGames = result.quantity_finished_games;
        this.backlogGames = result.quantity_backlog_games;
      },
      (error) => {
        this.toast.error('Erro ao carregar perfil');
        this.router.navigate(['/login']);
      }
    );
  }

  isEditingMode(): void {
    this.isEditing = !this.isEditing;
  }

  updateProfile(): void {
    this.service.updatePlayer(this.profile).subscribe(
      (result: any) => {
        this.toast.success('Perfil atualizado com sucesso!');
        this.isEditing = false;
      },
      (error) => {
        this.toast.error('Erro ao atualizar o perfil');
        console.error(error);
      }
    );
  }
}
