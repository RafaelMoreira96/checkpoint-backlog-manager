import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminCsvFunctionsService {
  BASE_URL = API_CONFIG.BASE_URL + '/api/v1';

  constructor(private http: HttpClient) {}

  importGenreCsv(file: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.BASE_URL}/genre/import_csv`, formData);
  }

  importManufacturerCsv(file: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.BASE_URL}/manufacturer/import_csv`, formData);
  }

  importConsoleCsv(file: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.BASE_URL}/console/import_csv`, formData);
  }
}
