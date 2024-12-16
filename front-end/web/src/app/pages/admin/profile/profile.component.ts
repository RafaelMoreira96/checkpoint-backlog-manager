import { Component, OnInit } from '@angular/core';
import { AdministratorService } from '../../../services/administrator.service';
import { Administrator } from '../../../models/administrator';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  profile: Administrator = new Administrator();
  constructor(
    private service: AdministratorService,
    private toast: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getProfile();
  }

  getProfile() {
    this.service.getAdministrator().subscribe(
      (result: any) => {
        this.profile = result;
      },
      (error) => {
        this.toast.error('Erro ao carregar perfil');
        this.router.navigate(['/admin-login']);
      }
    );
  }
}
