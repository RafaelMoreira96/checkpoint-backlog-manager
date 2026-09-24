import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface GameFromIGDBService {
  id: number;
  name: string;
  developer: string;
  url_image: string;
  release_year: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiIgdbService {
  private BASE_URL = `${API_CONFIG.BASE_URL}/api/v1/external/games`;

  constructor(private http: HttpClient) {}

  searchGames(query: string): Observable<GameFromIGDBService[]> {
    return this.http
      .get<GameFromIGDBService[]>(`${this.BASE_URL}/search`, {
        params: { q: query },
      })
      .pipe(
        catchError((error) => {
          console.error('Error searching games from catalog', error);
          return throwError(() => new Error('Error searching games from catalog'));
        })
      );
  }

  // Métodos legados para compatibilidade
  getGames(query: string): Observable<any> {
    return this.searchGames(query);
  }

  getCoverById(query: string): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/search`);
  }

  getInvolvedCompanyById(query: string): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/search`);
  }
}
