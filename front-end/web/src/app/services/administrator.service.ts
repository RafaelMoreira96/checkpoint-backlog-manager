import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class AdministratorService {
  BASE_URL = `${API_CONFIG.BASE_URL}/api/v1/admin`;

  constructor(private http: HttpClient) {}

  registerAdministrator(data: any) {
    return this.http.post(`${this.BASE_URL}/register`, data);
  }

  getAdministrator(id?: number) {
    const url = id ? `${this.BASE_URL}/view/${id}` : `${this.BASE_URL}/view`;
    return this.http.get(url);
  }

  getAdministrators() {
    return this.http.get(`${this.BASE_URL}/list`);
  }

  updateAdministrator(id: number, data: Record<string, any>) {
    if (!id) {
      throw new Error('ID is required for updating an administrator.');
    }

    if (!data) {
      throw new Error('Data is required for updating an administrator.');
    }

    return this.http.put(`${this.BASE_URL}/update/${id}`, data);
  }

  deleteAdministratorInProfile() {
    return this.http.delete(`${this.BASE_URL}/delete`);
  }

  deleteAdministratorInList(id: number) {
    return this.http.delete(`${this.BASE_URL}/delete/${id}`);
  }
}
