import { Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FrontendDashboardAdminService {
  BASE_URL = API_CONFIG.BASE_URL + '/api/v1/admin';
  token = localStorage.getItem('token');
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

  constructor(private http: HttpClient) {}

  getFiveLastPlayersAdded() {
    return this.http.get(`${this.BASE_URL}/last_players_added`, {
      headers: this.headers,
    });
  }

  getFiveLastAdminsAdded() {
    return this.http.get(`${this.BASE_URL}/last_admin_added`, {
      headers: this.headers,
    });
  }

  cardsInfo() {
    return this.http.get(`${this.BASE_URL}/cards_info`, {
      headers: this.headers,
    });
  }
}
