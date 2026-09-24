export type UserRole = 'player' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  token: string;
  refreshToken?: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password_hash: string;
}

export interface RegisterPlayerDto {
  name: string;
  email: string;
  password_hash: string;
}
