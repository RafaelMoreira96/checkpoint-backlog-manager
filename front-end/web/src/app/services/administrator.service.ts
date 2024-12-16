import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class AdministratorService {
  BASE_URL = `${API_CONFIG.BASE_URL}/api/v1/admin`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token não encontrado! Verifique a autenticação.');
      return new HttpHeaders();
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  registerAdministrator(data: any) {
    return this.http.post(`${this.BASE_URL}`, data, {
      headers: this.getHeaders(),
    });
  }

  getAdministrator(id?: number) {
    const url = id ? `${this.BASE_URL}/view/${id}` : `${this.BASE_URL}/view`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getAdministrators() {
    return this.http.get(`${this.BASE_URL}/list`, {
      headers: this.getHeaders(),
    });
  }

  updateAdministrator(id: number, data: Record<string, any>) {
    if (!id) {
      throw new Error('ID is required for updating an administrator.');
    }

    if (!data) {
      throw new Error('Data is required for updating an administrator.');
    }

    return this.http.put(`${this.BASE_URL}/update/${id}`, data, {
      headers: this.getHeaders(),
    });
  }

  deleteAdministratorInProfile() {
    return this.http.delete(`${this.BASE_URL}/delete`, {
      headers: this.getHeaders(),
    });
  }

  deleteAdministratorInList(id: number) {
    return this.http.delete(`${this.BASE_URL}/delete/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
