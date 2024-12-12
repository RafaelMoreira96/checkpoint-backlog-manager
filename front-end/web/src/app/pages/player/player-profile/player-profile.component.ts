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
        this.profile = result;
      },
      (error) => {
        this.toast.error('Erro ao carregar perfil');
        this.router.navigate(['/login']);
      }
    );
  }
}
