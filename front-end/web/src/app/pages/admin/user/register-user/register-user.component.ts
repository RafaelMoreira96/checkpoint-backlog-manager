import { Component, OnInit } from '@angular/core';
import { Administrator } from '../../../../models/administrator';
import { AdministratorService } from '../../../../services/administrator.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrl: './register-user.component.css',
})
export class RegisterUserComponent implements OnInit {
  admin: Administrator = new Administrator();
  isEditing: boolean = false;

  constructor(
    private adminService: AdministratorService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idAdmin = this.route.snapshot.paramMap.get('id_admin');
    if (idAdmin) {
      console.log(idAdmin);
      this.isEditing = true;
      this.getUser(+idAdmin);
    }
  }

  getUser(id: number) {
    this.adminService.getAdministrator(id).subscribe(
      (admin: any) => {
        this.admin = admin;
      },
      (error) => {
        this.toastr.error('Erro ao carregar os dados do usuário', 'Erro');
      }
    );
  }

  registerUser(): void {
    if (this.isEditing) {
      this.updateUser();
    } else {
      this.createUser();
    }
    this.router.navigate(['admin/list-user']);
  }

  createUser(): void {
    this.admin.access_type = Number(this.admin.access_type)
    this.adminService.registerAdministrator(this.admin).subscribe(
      (resp) => {
        
        this.toastr.success('Administrador cadastrado com sucesso!', 'Sucesso');
        this.admin = new Administrator();
      },
      (error) => {
        this.toastr.error('Erro ao cadastrar gênero.', 'Erro');
      }
    );
  }

  updateUser(): void {
    this.adminService
      .updateAdministrator(this.admin.id_administrator, this.admin)
      .subscribe(
        (resp) => {
          this.toastr.success(
            'Administrador atualizado com sucesso!',
            'Sucesso'
          );
        },
        (error) => {
          this.toastr.error('Erro ao atualizar gênero.', 'Erro');
        }
      );
  }
}
