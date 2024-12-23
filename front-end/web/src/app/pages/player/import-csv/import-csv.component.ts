import { Component } from '@angular/core';
import { PlayerCsvFunctionsService } from '../../../services/player-csv-functions.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-import-csv',
  templateUrl: './import-csv.component.html',
  styleUrl: './import-csv.component.css',
})
export class ImportCsvComponent {
  activeTab: string = 'jogos-zerados';
  selectedFiles: { [key: string]: File | null } = {
    genero: null,
    fabricante: null,
    console: null,
  };

  constructor(
    private service: PlayerCsvFunctionsService,
    private toast: ToastrService
  ) {}

  onFileSelected(event: Event, tipo: string): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.selectedFiles[tipo] = inputElement.files[0];
    }
  }

  onSubmitGameList(): void {
    if (this.selectedFiles['jogos-zerados']) {
      const file = this.selectedFiles['jogos-zerados'];
      this.service.importGameCsv(file).subscribe(
        (response) => {
          this.toast.success('Jogos importados com sucesso!', 'Sucesso!');
          this.selectedFiles['jogos-zerados'] = null;
        },
        (error) => {
          console.error('Erro ao importar jogos', error);
        }
      );
    }
  }

  onSubmitBacklog(): void {
    if (this.selectedFiles['backlog']) {
      const file = this.selectedFiles['backlog'];
      this.service.importBacklogCsv(file).subscribe(
        (response) => {
          this.toast.success('Backlog importado com sucesso!', 'Sucesso!');
          this.selectedFiles['backlog'] = null;
        },
        (error) => {
          console.error('Erro ao importar backlog', error);
        }
      );
    }
  }
}
