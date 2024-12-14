import { Component, OnInit } from '@angular/core';
import { ProjectUpdateLog } from '../../../../models/project-update-log';
import { ProjectUpdateLogService } from '../../../../services/project-update-log.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-list-log',
  templateUrl: './list-log.component.html',
  styleUrl: './list-log.component.css',
})
export class ListLogComponent implements OnInit {
  logList: ProjectUpdateLog[] = [];
  selectedLogProjectId: number | null = null;

  constructor(
    private service: ProjectUpdateLogService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.getLogs();
  }

  getLogs() {
    this.service.getLogs().subscribe(
      (result: any) => {
        this.logList = result;
      },
      (error) => {
        this.toast.error('Erro ao carregar os logs', 'Erro');
      }
    );
  }

  openModal(id: number): void {
    this.selectedLogProjectId = id;
  }

  removeLog() {
    if (this.selectedLogProjectId !== null) {
      this.service.removeLog(this.selectedLogProjectId).subscribe(
        () => {
          this.toast.success('Log removido com sucesso');
          this.getLogs();
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }
}
