import { Component } from '@angular/core';
import { Manufacturer } from '../../../../models/manufacturer';
import { ManufacturerService } from '../../../../services/manufacturer.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-list-manufacturer',
  templateUrl: './list-manufacturer.component.html',
  styleUrl: './list-manufacturer.component.css',
})
export class ListManufacturerComponent {
  manufacturerList: Manufacturer[] = [];
  selectedManufacturerId: number | null = null;

  constructor(
    private service: ManufacturerService,
    private router: Router,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.getManufacturers();
  }

  getManufacturers() {
    this.service.getManufacturers().subscribe(
      (result: any) => {
        this.manufacturerList = result;
      },
      (error) => {
        this.toast.error('Erro ao carregar os fabricantes', 'Erro');
      }
    );
  }

  openModal(id: number): void {
    this.selectedManufacturerId = id;
  }

  removeManufacturer() {
    if (this.selectedManufacturerId !== null) {
      this.service.deleteManufacturer(this.selectedManufacturerId).subscribe(
        (result: any) => {
          console.log('Fabricante removido com sucesso');
          this.getManufacturers();
          this.selectedManufacturerId = null;
        },
        (error) => {
          this.toast.error('Erro ao remover o fabricante', 'Erro');
        }
      );
    }
  }

  editManufacturer(manufacturer: Manufacturer) {
    this.router.navigate([
      'admin/register-manufacturer/',
      manufacturer.id_manufacturer,
    ]);
  }
}
