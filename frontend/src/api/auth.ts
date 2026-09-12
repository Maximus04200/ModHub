import { apiClient } from './client';
import type { AuthResult } from './types';

export const authApi = {
  async register(email: string, password: string, displayName: string): Promise<AuthResult> {
    const { data } = await apiClient.post<AuthResult>('/auth/register', {
      email,
      password,
      displayName,
    });
    return data;
  },

  async login(email: string, password: string): Promise<AuthResult> {
    const { data } = await apiClient.post<AuthResult>('/auth/login', { email, password });
    return data;
  },
};
