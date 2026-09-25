export interface User {
  id_player: number;
  name_player: string;
  email: string;
  nickname: string;
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
  is_public?: boolean;
  is_active?: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
}

export interface LoginDto {
  nickname: string;
  password: string;
}

export interface RegisterPlayerDto {
  name_player: string;
  email: string;
  nickname: string;
  password: string;
}

export interface UpdatePlayerDto {
  name_player?: string;
  email?: string;
  nickname?: string;
  password?: string;
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
  is_public?: boolean;
}

export interface PublicProfileResponse {
  is_private: boolean;
  message?: string;
  player: User;
  quantity_finished_games?: number;
  quantity_backlog_games?: number;
  recent_games?: any[];
}
