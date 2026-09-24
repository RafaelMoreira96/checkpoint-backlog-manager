import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Genre } from '../models/genre';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class GenreService {
  BASE_URL = API_CONFIG.BASE_URL + '/api/v1/genre';

  constructor(private http: HttpClient) {}

  getGenres() {
    return this.http.get(`${this.BASE_URL}/list`);
  }

  getDeactivatedGenres() {
    return this.http.get(`${this.BASE_URL}/list/deactivated`);
  }

  getGenre(id: number) {
    return this.http.get(`${this.BASE_URL}/${id}`);
  }

  createGenre(data: Genre) {
    return this.http.post(`${this.BASE_URL}`, data);
  }

  updateGenre(id: number, data: Genre) {
    return this.http.put(`${this.BASE_URL}/${id}`, data);
  }

  deleteGenre(id: number) {
    return this.http.delete(`${this.BASE_URL}/${id}`);
  }

  reactivateGenre(id: number) {
    return this.http.put(`${this.BASE_URL}/activate/${id}`, {});
  }
}
