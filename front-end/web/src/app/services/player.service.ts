import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  BASE_URL = API_CONFIG.BASE_URL + '/api/v1/player';
  token = localStorage.getItem('token');
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

  constructor(private http: HttpClient) {}

  registerPlayer(data: any) {
    return this.http.post(`${this.BASE_URL}`, data);
  }

  viewPlayer() {
    return this.http.get(`${this.BASE_URL}/view`, { headers: this.headers });
  }

  deletePlayer() {
    return this.http.delete(`${this.BASE_URL}/delete`, {
      headers: this.headers,
    });
  }
}
