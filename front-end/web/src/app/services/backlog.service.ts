import { Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BacklogService {
  BASE_URL = API_CONFIG.BASE_URL + '/api/v1/backlog';
  token = localStorage.getItem('token');
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

  constructor(private http: HttpClient) { }

  getBacklog() {
    return this.http.get(this.BASE_URL, { headers: this.headers });
  }

  postBacklog(data: any) {
    return this.http.post(this.BASE_URL, data, { headers: this.headers });
  }
}
