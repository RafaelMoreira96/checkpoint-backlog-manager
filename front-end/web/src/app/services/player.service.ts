import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  BASE_URL = API_CONFIG.BASE_URL + '/api/v1/player';

  constructor(private http: HttpClient) {}

  registerPlayer(data: any) {
    return this.http.post(`${this.BASE_URL}/register`, data);
  }

  viewPlayer() {
    return this.http.get(`${this.BASE_URL}/view`);
  }

  deletePlayer() {
    return this.http.delete(`${this.BASE_URL}/delete`);
  }

  updatePlayer(data: any) {
    return this.http.put(`${this.BASE_URL}/update`, data);
  }
}
