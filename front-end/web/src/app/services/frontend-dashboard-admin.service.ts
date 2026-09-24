import { Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FrontendDashboardAdminService {
  BASE_URL = API_CONFIG.BASE_URL + '/api/v1/admin';

  constructor(private http: HttpClient) {}

  getFiveLastPlayersAdded() {
    return this.http.get(`${this.BASE_URL}/last_players_added`);
  }

  getFiveLastAdminsAdded() {
    return this.http.get(`${this.BASE_URL}/last_admin_added`);
  }

  cardsInfo() {
    return this.http.get(`${this.BASE_URL}/cards_info`);
  }
}
