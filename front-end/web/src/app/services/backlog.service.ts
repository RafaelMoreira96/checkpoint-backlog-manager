import { Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class BacklogService {
  BASE_URL = API_CONFIG.BASE_URL + '/api/v1/backlog';
  token = localStorage.getItem('token');
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

  constructor(private http: HttpClient) { }

  getBacklog() {
    return this.http.get(`${this.BASE_URL}/list`, { headers: this.headers });
  }

  getBacklogById(id: number) {
    return this.http.get(`${API_CONFIG.BASE_URL}/api/v1/game/${id}`, { headers: this.headers });
  }

  postBacklog(data: any) {
    return this.http.post(this.BASE_URL, data, { headers: this.headers });
  }

  deleteGame(id: number) {
    return this.http.delete(`${API_CONFIG.BASE_URL}/api/v1/game/delete_beaten/${id}`, { headers: this.headers });
  }

  updateGame(id: number, data: Game) {
    return this.http.put(`${API_CONFIG.BASE_URL}/api/v1/game/${id}`, data, { headers: this.headers });
  }
}
