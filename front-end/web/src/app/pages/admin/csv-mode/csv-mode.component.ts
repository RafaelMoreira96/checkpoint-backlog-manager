import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AdminCsvFunctionsService } from '../../../services/admin-csv-functions.service';

@Component({
  selector: 'app-csv-mode',
  templateUrl: './csv-mode.component.html',
  styleUrls: ['./csv-mode.component.css'],
})
export class CsvModeComponent {
  activeTab: string = 'instructions';
  selectedFiles: { [key: string]: File | null } = {
    genero: null,
    fabricante: null,
    console: null,
  };

  constructor(
    private service: AdminCsvFunctionsService,
    private toast: ToastrService
  ) {}

  onFileSelected(event: Event, tipo: string): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.selectedFiles[tipo] = inputElement.files[0];
    }
  }

  onSubmitGenero(): void {
    if (this.selectedFiles['genero']) {
      const file = this.selectedFiles['genero'];
      this.service.importGenreCsv(file).subscribe(
        (response) => {
          this.toast.success('Gêneros importados com sucesso!', 'Sucesso!');
          this.selectedFiles['genero'] = null;
        },
        (error) => {
          console.error('Erro ao importar gêneros', error);
        }
      );
    }
  }

  onSubmitFabricante(): void {
    if (this.selectedFiles['fabricante']) {
      const file = this.selectedFiles['fabricante'];
      this.service.importManufacturerCsv(file).subscribe(
        (response) => {
          this.toast.success('Fabricantes importados com sucesso!', 'Sucesso!');
          this.selectedFiles['fabricantes'] = null;
        },
        (error) => {
          console.error('Erro ao importar fabricantes', error);
        }
      );
    }
  }

  onSubmitConsole(): void {
    if (this.selectedFiles['console']) {
      const file = this.selectedFiles['console'];
      this.service.importConsoleCsv(file).subscribe(
        (response) => {
          this.toast.success('Consoles importados com sucesso!', 'Sucesso!');
          this.selectedFiles['consoles'] = null;
        },
        (error) => {
          console.error('Erro ao importar consoles', error);
        }
      );
    }
  }
}
