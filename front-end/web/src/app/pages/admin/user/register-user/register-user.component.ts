import { Component, OnInit } from '@angular/core';
import { Administrator } from '../../../../models/administrator';
import { AdministratorService } from '../../../../services/administrator.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css'], // Correção: 'styleUrls' para array, não 'styleUrl'
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
      this.isEditing = true;
      this.getUser(Number(idAdmin)); // Correção: Garantir que 'idAdmin' seja convertido para número
    }
  }

  getUser(id: number): void {
    this.adminService.getAdministrator(id).subscribe(
      (admin: any) => {
        this.admin = admin;
      },
      (error) => {
        this.toastr.error('Erro ao carregar os dados do administrador.', 'Erro');
      }
    );
  }

  registerUser(): void {
    if (this.isEditing) {
      this.updateUserById();
    } else {
      this.createUser();
    }
  }

  createUser(): void {
    this.admin.access_type = Number(this.admin.access_type); // Garantir conversão
    this.adminService.registerAdministrator(this.admin).subscribe(
      () => {
        this.toastr.success('Administrador cadastrado com sucesso!', 'Sucesso');
        this.admin = new Administrator(); // Limpa o formulário após o sucesso
        this.router.navigate(['admin/list-user']); // Mover navegação aqui para evitar redirecionamento prematuro
      },
      (error) => {
        this.toastr.error('Erro ao cadastrar o administrador.', 'Erro'); // Corrigir mensagem
      }
    );
  }

  updateUserById(): void {
    this.admin.access_type = Number(this.admin.access_type); // Ensure conversion
    this.adminService.updateAdministrator(this.admin.id_administrator, this.admin).subscribe(
      () => {
        this.toastr.success('Administrador atualizado com sucesso!', 'Sucesso');
        this.router.navigate(['admin/list-user']); // Move navigation here to avoid premature redirection
      },
      (error) => {
        this.toastr.error('Erro ao atualizar o administrador.', 'Erro'); // Correct message
      }
    );
  }
}
