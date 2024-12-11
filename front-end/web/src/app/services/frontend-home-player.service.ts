import { Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FrontendHomePlayerService {
  BASE_URL = API_CONFIG.BASE_URL + '/api/v1/player';
  token = localStorage.getItem('token');
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

  constructor(private http: HttpClient) { }

  lastGamesBeaten() {
    return this.http.get(`${this.BASE_URL}/last_games`, { headers: this.headers });
  }

  getPreferedAndUnpreferedGenre(){
    return this.http.get(`${this.BASE_URL}/prefered_genre`, { headers: this.headers });
  }

  loadBacklog() {
    return this.http.get(`${this.BASE_URL}/last_backlog`, { headers: this.headers });
  }
}
