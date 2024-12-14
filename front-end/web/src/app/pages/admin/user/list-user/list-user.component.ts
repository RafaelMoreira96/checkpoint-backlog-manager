import { Component, OnInit } from '@angular/core';
import { Administrator } from '../../../../models/administrator';
import { AdministratorService } from '../../../../services/administrator.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-list-user',
  templateUrl: './list-user.component.html',
  styleUrl: './list-user.component.css',
})
export class ListUserComponent implements OnInit {
  adminList: Administrator[] = [];
  selectedAdminId: number | null = null;

  constructor(
    private service: AdministratorService,
    private router: Router,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.getAdmins();
  }

  getAdmins() {
    this.service.getAdministrators().subscribe(
      (result: any) => {
        this.adminList = result;
      },
      (error) => {
        this.toast.error('Erro ao carregar os administradores', 'Erro');
      }
    );
  }

  openModal(id: number): void {
    this.selectedAdminId = id;
  }

  removeAdmin() {
    if (this.selectedAdminId !== null) {
      this.service.deleteAdministratorInList(this.selectedAdminId).subscribe(
        () => {
          this.toast.success('Administrador removido com sucesso');
          this.getAdmins();
          this.selectedAdminId = null;
        },
        (error) => {
          this.toast.error('Erro ao remover o administrador', 'Erro');
        }
      );
    }
  }

  editAdmin(admin: Administrator) {
    this.router.navigate(['admin/register-user/', admin.id_administrator]);
  }
}
