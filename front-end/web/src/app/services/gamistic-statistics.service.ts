import { Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GamisticStatisticsService {
  BASE_URL = API_CONFIG.BASE_URL + '/api/v1/statistics';
  token = localStorage.getItem('token');
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

  constructor(private http: HttpClient) {}

  getBeatenStats(){
    return this.http.get(`${this.BASE_URL}/beaten-statistics`, {
      headers: this.headers,
    });
  }
}
