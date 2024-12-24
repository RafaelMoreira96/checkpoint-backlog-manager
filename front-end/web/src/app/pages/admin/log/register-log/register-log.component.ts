import { Component } from '@angular/core';
import { ProjectUpdateLogService } from '../../../../services/project-update-log.service';
import { ProjectUpdateLog } from '../../../../models/project-update-log';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-log',
  templateUrl: './register-log.component.html',
  styleUrls: ['./register-log.component.css'], // Corrigido styleUrls
})
export class RegisterLogComponent {
  log: ProjectUpdateLog = {
    content: '',
    description: '',
    author_id: 0,
    id_project_update_log: 0,
  }; 

  description: string = '';
  content: string = '';

  constructor(
    private service: ProjectUpdateLogService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  registerLog(): void {
    this.log.content = this.content;
    this.log.description = this.description;

    this.service.registerLog(this.log).subscribe(
      (resp) => {
        this.toastr.success('Log inserido com sucesso', 'Sucesso');
        this.router.navigate(['/list-logs']);
      },
      (error) => {
        this.toastr.error(
          `Erro ao cadastrar log: ${error.message || 'Erro desconhecido'}`,
          'Erro'
        );
      }
    );
  }
}
