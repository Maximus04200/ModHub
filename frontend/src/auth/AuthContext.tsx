import { createContext, use, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import { setAuthToken } from '../api/client';
import type { AuthUser } from '../api/types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'modhub.auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const { token, user: storedUser } = JSON.parse(raw) as { token: string; user: AuthUser };
      setAuthToken(token);
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  function persist(token: string, authUser: AuthUser): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: authUser }));
    setAuthToken(token);
    setUser(authUser);
  }

  async function login(email: string, password: string): Promise<void> {
    const result = await authApi.login(email, password);
    persist(result.token, result.user);
  }

  async function register(email: string, password: string, displayName: string): Promise<void> {
    const result = await authApi.register(email, password, displayName);
    persist(result.token, result.user);
  }

  function logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
    setUser(null);
  }

  return (
    <AuthContext value={{ user, loading, login, register, logout }}>{children}</AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = use(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return ctx;
}
