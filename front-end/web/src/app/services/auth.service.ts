import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private jwtService: JwtHelperService = new JwtHelperService();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  authenticate(nickname: string, password: string): Observable<any> {
    const loginPayload = { nickname, password };

    return this.http
      .post(`${API_CONFIG.BASE_URL}/api/v1/login`, loginPayload, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        observe: 'response',
        responseType: 'json',
      })
      .pipe(
        catchError((error) => {
          console.error('Erro na autenticação:', error);
          return throwError(
            () => new Error('Falha na autenticação, tente novamente.')
          );
        })
      );
  }

  authenticateAdmin(nickname: string, password: string): Observable<any> {
    const loginPayload = { nickname, password };

    return this.http
      .post(`${API_CONFIG.BASE_URL}/api/v1/admin_login`, loginPayload, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        observe: 'response',
        responseType: 'json',
      })
      .pipe(
        catchError((error) => {
          console.error('Erro na autenticação:', error);
          return throwError(
            () => new Error('Falha na autenticação, tente novamente.')
          );
        })
      );
  }

  successfulLogin(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token != null && !this.jwtService.isTokenExpired(token);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}
