import { Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';
import { HttpClient } from '@angular/common/http';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class BacklogService {
  BASE_URL = API_CONFIG.BASE_URL + '/api/v1/backlog';

  constructor(private http: HttpClient) { }

  getBacklog() {
    return this.http.get(`${this.BASE_URL}/list`);
  }

  getBacklogById(id: number) {
    return this.http.get(`${API_CONFIG.BASE_URL}/api/v1/game/${id}`);
  }

  postBacklog(data: any) {
    return this.http.post(this.BASE_URL, data);
  }

  deleteGame(id: number) {
    return this.http.delete(`${API_CONFIG.BASE_URL}/api/v1/game/delete_beaten/${id}`);
  }

  updateGame(id: number, data: Game) {
    return this.http.put(`${API_CONFIG.BASE_URL}/api/v1/game/${id}`, data);
  }
}
