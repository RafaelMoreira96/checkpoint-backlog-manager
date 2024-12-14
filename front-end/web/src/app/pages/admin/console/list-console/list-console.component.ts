import { Component } from '@angular/core';
import { Console } from '../../../../models/console';
import { ConsoleService } from '../../../../services/console.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-list-console',
  templateUrl: './list-console.component.html',
  styleUrl: './list-console.component.css',
})
export class ListConsoleComponent {
  consoleList: Console[] = [];
  selectedConsoleId: number | null = null;

  constructor(
    private service: ConsoleService,
    private router: Router,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.getConsoles();
  }

  getConsoles() {
    this.service.getConsoles().subscribe(
      (result: any) => {
        this.consoleList = result;
      },
      (error) => {
        this.toast.error('Erro ao carregar os consoles', 'Erro');
      }
    );
  }

  openModal(id: number): void {
    this.selectedConsoleId = id;
  }

  removeConsole() {
    if (this.selectedConsoleId !== null) {
      this.service.deleteConsole(this.selectedConsoleId).subscribe(
        () => {
          this.toast.success('Console removido com sucesso');
          this.getConsoles();
          this.selectedConsoleId = null;
        },
        (error) => {
          this.toast.error('Erro ao remover o console', 'Erro');
        }
      )
    }
  }

  editConsole(console: Console) {
    this.router.navigate(['admin/register-console', console.id_console]);
  }
}
