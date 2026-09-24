import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Console } from '../models/console';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class ConsoleService {
  BASE_URL = API_CONFIG.BASE_URL + '/api/v1/console';

  constructor(private http: HttpClient) {}

  getConsoles() {
    return this.http.get(`${this.BASE_URL}/list`);
  }

  getDeactivatedConsoles() {
    return this.http.get(`${this.BASE_URL}/list/deactivated`);
  }

  getConsole(id: number) {
    return this.http.get(`${this.BASE_URL}/${id}`);
  }

  createConsole(data: Console) {
    return this.http.post(`${this.BASE_URL}`, data);
  }

  updateConsole(id: number, data: Console) {
    return this.http.put(`${this.BASE_URL}/${id}`, data);
  }

  deleteConsole(id: number) {
    return this.http.delete(`${this.BASE_URL}/${id}`);
  }

  reactivateConsole(id: number) {
    return this.http.put(`${this.BASE_URL}/activate/${id}`, {});
  }
}
