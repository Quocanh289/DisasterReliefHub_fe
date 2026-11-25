export type UserRole = 'Admin' | 'Coordinator' | 'Volunteer' | 'Requester';

export interface AuthResponse {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'Requester' | 'Volunteer';
}

export interface RefreshRequest {
  refreshToken: string;
}
