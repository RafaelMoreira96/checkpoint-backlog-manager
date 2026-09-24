import { HttpHeaders } from '@angular/common/http';

export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',

  get token() {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  },

  get headers() {
    const token = this.token;
    return token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
  },
};
