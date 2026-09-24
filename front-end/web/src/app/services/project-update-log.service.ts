import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProjectUpdateLog } from '../models/project-update-log';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class ProjectUpdateLogService {
  BASE_URL = API_CONFIG.BASE_URL + '/api/v1/log';

  constructor(private http: HttpClient) {}

  getLogs() {
    return this.http.get(`${this.BASE_URL}/list`);
  }

  registerLog(log: ProjectUpdateLog) {
    return this.http.post(`${this.BASE_URL}`, log);
  }

  removeLog(id: number) {
    return this.http.delete(`${this.BASE_URL}/${id}`);
  }
}
