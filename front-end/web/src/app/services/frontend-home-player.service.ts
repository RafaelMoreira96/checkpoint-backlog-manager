import { Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FrontendHomePlayerService {
  BASE_URL = API_CONFIG.BASE_URL + '/api/v1/player';

  constructor(private http: HttpClient) { }

  lastGamesBeaten() {
    return this.http.get(`${this.BASE_URL}/last_games`);
  }

  getPreferedAndUnpreferedGenre(){
    return this.http.get(`${this.BASE_URL}/prefered_genre`);
  }

  loadBacklog() {
    return this.http.get(`${this.BASE_URL}/last_backlog`);
  }
}
