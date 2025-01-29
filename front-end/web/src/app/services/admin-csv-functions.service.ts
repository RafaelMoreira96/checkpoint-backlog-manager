import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminCsvFunctionsService {
  BASE_URL = API_CONFIG.BASE_URL + '/api/v1';

  constructor(private http: HttpClient) {}

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  importGenreCsv(file: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    const headers = this.getHeaders();
    return this.http.post(`${this.BASE_URL}/genre/import_csv`, formData, {
      headers,
    });
  }

  importManufacturerCsv(file: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    const headers = this.getHeaders();
    return this.http.post(`${this.BASE_URL}/manufacturer/import_csv`, formData, {
      headers,
    });
  }

  importConsoleCsv(file: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    const headers = this.getHeaders();
    return this.http.post(`${this.BASE_URL}/console/import_csv`, formData, {
      headers,
    });
  }
}
