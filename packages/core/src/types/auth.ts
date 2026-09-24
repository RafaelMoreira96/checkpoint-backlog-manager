export type UserRole = 'player' | 'admin';

export interface User {
  id_player: number;
  name_player: string;
  email: string;
  nickname: string;
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
