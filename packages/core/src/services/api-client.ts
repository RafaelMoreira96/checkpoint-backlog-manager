import { Game, CreateGameDto, UpdateGameDto } from '../types/game';
import { Console, Genre } from '../types/catalog';
import {
  DashboardStats,
  LandingPageStats,
  BeatenStatsResponse,
  StatsItemDetail,
} from '../types/stats';
import { User, AuthResponse, LoginDto, RegisterPlayerDto, UpdatePlayerDto } from '../types/auth';
import { IGDBGameResult } from '../types/igdb';

export interface StorageAdapter {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
}

export interface ApiClientConfig {
  baseUrl?: string;
  storage?: StorageAdapter;
  getToken?: () => string | null | Promise<string | null>;
}

export class CheckpointApiClient {
  private baseUrl: string;
  private storage?: StorageAdapter;
  private customGetToken?: () => string | null | Promise<string | null>;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:8080/api/v1';
    this.storage = config.storage;
    this.customGetToken = config.getToken;
  }

  async getToken(): Promise<string | null> {
    if (this.customGetToken) {
      return await this.customGetToken();
    }
    if (this.storage) {
      return await this.storage.getItem('token');
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem('token');
    }
    return null;
  }

  async setToken(token: string): Promise<void> {
    if (this.storage) {
      await this.storage.setItem('token', token);
    } else if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('token', token);
    }
  }

  async clearToken(): Promise<void> {
    if (this.storage) {
      await this.storage.removeItem('token');
    } else if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('token');
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = await this.getToken();

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Erro HTTP: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Fallback to text status
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  }

  // --- Auth Endpoints ---
  async login(dto: LoginDto): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    if (data.token) {
      await this.setToken(data.token);
    }
    return data;
  }

  async registerPlayer(dto: RegisterPlayerDto): Promise<User> {
    return await this.request<User>('/player/register', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async getProfile(): Promise<User> {
    const res = await this.request<any>('/player/view');
    return res.player || res;
  }

  async updateProfile(dto: UpdatePlayerDto): Promise<User> {
    return await this.request<User>('/player/update', {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  }

  // --- Games Endpoints ---
  async getGames(): Promise<Game[]> {
    return await this.request<Game[]>('/game/list_beaten');
  }

  async getGame(id: number): Promise<Game> {
    return await this.request<Game>(`/game/${id}`);
  }

  async createGame(game: CreateGameDto): Promise<Game> {
    return await this.request<Game>('/game', {
      method: 'POST',
      body: JSON.stringify(game),
    });
  }

  async updateGame(id: number, game: UpdateGameDto): Promise<Game> {
    return await this.request<Game>(`/game/${id}`, {
      method: 'PUT',
      body: JSON.stringify(game),
    });
  }

  async deleteGame(id: number): Promise<void> {
    await this.request<void>(`/game/delete_beaten/${id}`, {
      method: 'DELETE',
    });
  }

  async importGamesCSV(file: File): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return await this.request<{ message: string }>('/game/import_csv', {
      method: 'POST',
      body: formData,
    });
  }

  // --- Backlog Endpoints ---
  async getBacklog(): Promise<Game[]> {
    return await this.request<Game[]>('/backlog/list');
  }

  async createBacklog(game: CreateGameDto): Promise<Game> {
    return await this.request<Game>('/backlog', {
      method: 'POST',
      body: JSON.stringify(game),
    });
  }

  async deleteBacklog(id: number): Promise<void> {
    await this.request<void>(`/game/delete_beaten/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Catalog Endpoints ---
  async getConsoles(): Promise<Console[]> {
    return await this.request<Console[]>('/console/list');
  }

  async getGenres(): Promise<Genre[]> {
    return await this.request<Genre[]>('/genre/list');
  }

  // --- Dashboard & Summary Stats Endpoints ---
  async getDashboardStats(): Promise<DashboardStats> {
    return await this.request<DashboardStats>('/player/prefered_genre');
  }

  async getLastGamesBeaten(): Promise<Game[]> {
    return await this.request<Game[]>('/player/last_games');
  }

  async getLastBacklog(): Promise<Game[]> {
    return await this.request<Game[]>('/player/last_backlog');
  }

  async getLandingPageStats(): Promise<LandingPageStats> {
    return await this.request<LandingPageStats>('/landing-page/stats');
  }

  // --- Gamer Detailed Statistics Endpoints ---
  async getBeatenStats(): Promise<BeatenStatsResponse> {
    return await this.request<BeatenStatsResponse>('/statistics/beaten-statistics');
  }

  async getStatsByGenre(genreId: number): Promise<StatsItemDetail> {
    return await this.request<StatsItemDetail>(`/statistics/beaten-by-genre/${genreId}`);
  }

  async getStatsByConsole(consoleId: number): Promise<StatsItemDetail> {
    return await this.request<StatsItemDetail>(`/statistics/beaten-by-console/${consoleId}`);
  }

  async getStatsByReleaseYear(year: number): Promise<StatsItemDetail> {
    return await this.request<StatsItemDetail>(`/statistics/beaten-by-release-year/${year}`);
  }

  // --- IGDB Proxy Endpoint ---
  async searchIGDB(query: string): Promise<IGDBGameResult[]> {
    if (!query || query.trim().length === 0) return [];
    return await this.request<IGDBGameResult[]>(
      `/external/games/search?q=${encodeURIComponent(query)}`
    );
  }

  async syncIGDBGenres(): Promise<{ message: string; count: number }> {
    return await this.request<{ message: string; count: number }>('/external/genres/sync', {
      method: 'POST',
    });
  }
}

