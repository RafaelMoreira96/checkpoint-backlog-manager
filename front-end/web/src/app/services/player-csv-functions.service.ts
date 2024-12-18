import { Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PlayerCsvFunctionsService {
  BASE_URL = API_CONFIG.BASE_URL + '/api/v1';
  token = localStorage.getItem('token');
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

  constructor(private http: HttpClient) {}

  importGameCsv(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.BASE_URL}/game/import_csv`, formData, {
      headers: this.headers,
    });
  }

  importBacklogCsv(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.BASE_URL}/backlog/import_csv`, formData, {
      headers: this.headers,
    });
  }
}
