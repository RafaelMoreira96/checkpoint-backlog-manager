import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class ManufacturerService {
  BASE_URL = API_CONFIG.BASE_URL + '/api/v1/manufacturer';

  constructor(private http: HttpClient) {}

  getManufacturers() {
    return this.http.get(`${this.BASE_URL}/list`);
  }

  getDeactivatedManufacturers() {
    return this.http.get(`${this.BASE_URL}/list/deactivated`);
  }

  getManufacturer(id: number) {
    return this.http.get(`${this.BASE_URL}/${id}`);
  }

  createManufacturer(data: any) {
    return this.http.post(`${this.BASE_URL}`, data);
  }

  updateManufacturer(id: number, data: any) {
    return this.http.put(`${this.BASE_URL}/${id}`, data);
  }

  deleteManufacturer(id: number) {
    return this.http.delete(`${this.BASE_URL}/${id}`);
  }

  reactivateManufacturer(id: number) {
    return this.http.put(`${this.BASE_URL}/activate/${id}`, {});
  }
}
