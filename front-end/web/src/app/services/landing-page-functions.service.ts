import { Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LandingPageFunctionsService {
  BASE_URL = API_CONFIG.BASE_URL + '/api/v1/landing-page';

  constructor(private http: HttpClient) { }

  getStats() {
    return this.http.get(`${this.BASE_URL}/stats`);
  }

}
