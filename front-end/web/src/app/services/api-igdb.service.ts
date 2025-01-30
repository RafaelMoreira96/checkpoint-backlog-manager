import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class ApiIgdbService {
  private BASE_URL = environment.BASE_URL;
  private CLIENT_ID = environment.CLIENT_ID;
  private TOKEN = environment.TOKEN;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Client-ID': this.CLIENT_ID,
      Authorization: `Bearer ${this.TOKEN}`,
    });
  }

  getGames(query: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/games`, query, { headers: this.getHeaders() })
      .pipe(this.handleError('Error fetching games'));
  }

  getCoverById(query: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/covers`, query, { headers: this.getHeaders() })
      .pipe(this.handleError('Error fetching cover'));
  }

  getInvolvedCompanyById(query: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/involved_companies`, query, { headers: this.getHeaders() })
      .pipe(this.handleError('Error fetching involved companies'));
  }

  private handleError(errorMessage: string) {
    return catchError((error) => {
      console.error(errorMessage, error);
      return throwError(() => new Error(errorMessage));
    });
  }
}
