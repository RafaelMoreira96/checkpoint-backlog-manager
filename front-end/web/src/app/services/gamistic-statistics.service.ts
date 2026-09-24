import { Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GamisticStatisticsService {
  BASE_URL = API_CONFIG.BASE_URL + '/api/v1/statistics';

  constructor(private http: HttpClient) {}

  getBeatenStats() {
    return this.http.get(`${this.BASE_URL}/beaten-statistics`);
  }

  getBeatenStatsByItem(itemId: number, type: string) {
    switch (type) {
      case 'console':
        return this.http.get(`${this.BASE_URL}/beaten-by-console/${itemId}`);
      case 'genre':
        return this.http.get(`${this.BASE_URL}/beaten-by-genre/${itemId}`);
      case 'year':
        return this.http.get(`${this.BASE_URL}/beaten-by-release-year/${itemId}`);
      default:
        return this.http.get(`${this.BASE_URL}/beaten-by-console/${itemId}`);
    }
  }
}
