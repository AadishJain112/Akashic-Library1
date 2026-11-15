import { apiRequest } from './http';

export type UserRole = 'USER' | 'MODERATOR' | 'STORE_MANAGER' | 'ADMIN';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  display_name: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  detail: string;
  user: UserProfile;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface HealthResponse {
  status: string;
  service: string;
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async logout(): Promise<{ detail: string }> {
    return apiRequest<{ detail: string }>('/api/auth/logout/', {
      method: 'POST',
    });
  },

  async getMe(): Promise<UserProfile> {
    return apiRequest<UserProfile>('/api/auth/me/');
  },

  async checkHealth(): Promise<HealthResponse> {
    return apiRequest<HealthResponse>('/api/health/');
  },
};
