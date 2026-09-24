import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game } from '../models/game';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  BASE_URL = API_CONFIG.BASE_URL + '/api/v1/game';

  constructor(private http: HttpClient) {}

  registerGame(data: Game) {
    return this.http.post(`${this.BASE_URL}`, data);
  }

  updateGame(id_game: number, data: Game) {
    return this.http.put(`${this.BASE_URL}/${data.id_game}`, data);
  }

  updateGames(data: any[]) {
    return this.http.put(`${API_CONFIG.BASE_URL}/api/v1/update_missing_data_list`, data);
  }

  getGames() {
    return this.http.get(`${this.BASE_URL}/list_beaten`);
  }

  getGame(id: number) {
    return this.http.get(`${this.BASE_URL}/${id}`);
  }

  deleteGame(id: number) {
    return this.http.delete(`${this.BASE_URL}/delete_beaten/${id}`);
  }
}
