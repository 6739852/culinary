export interface User {
  _id?: string;
  username: string;
  email: string;
  address: string;
  role?: 'user' | 'admin';
  createdAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  address: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}