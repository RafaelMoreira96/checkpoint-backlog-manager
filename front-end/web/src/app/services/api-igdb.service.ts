import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiIgdbService {
  private BASE_URL = '/api';
  private CLIENT_ID = 'zlv00a8uei2v4b7a7nhyqe484c9t1v';
  private TOKEN = 'a5nxsmq2xhinrcmevd61i4evbyjzaw';

  constructor(private http: HttpClient) {}

  getGames(query: string): Observable<any> {
    const headers = new HttpHeaders({
      'Client-ID': this.CLIENT_ID,
      Authorization: `Bearer ${this.TOKEN}`,
    });

    return this.http.post(`${this.BASE_URL}/games`, query, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching games:', error);
        return throwError(() => error);
      })
    );
  }

  getCoverById(query: string): Observable<any> {
    const headers = new HttpHeaders({
      'Client-ID': this.CLIENT_ID,
      Authorization: `Bearer ${this.TOKEN}`,
    });

    return this.http.post(`${this.BASE_URL}/covers`, query, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching cover:', error);
        return throwError(() => error);
      })
    );
  }

  getInvolvedCompanyById(query: string): Observable<any> {
    const headers = new HttpHeaders({
      'Client-ID': this.CLIENT_ID,
      Authorization: `Bearer ${this.TOKEN}`,
    });

    return this.http
      .post(`${this.BASE_URL}/involved_companies`, query, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error fetching involved companies:', error);
          return throwError(() => error);
        })
      );
  }
}
