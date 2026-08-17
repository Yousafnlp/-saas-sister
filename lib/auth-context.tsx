'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, getToken, setToken, clearToken } from '@/lib/api';

type UserRole = 'Admin' | 'Manager' | 'Staff' | null;

interface MeResponse {
  success: boolean;
  data: { id: string; name: string; email: string; role: 'Admin' | 'Manager' | 'Staff' };
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: UserRole;
  userEmail: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    api
      .get<MeResponse>('/auth/me')
      .then((res) => {
        setUserEmail(res.data.email);
        setUserRole(res.data.role);
        setIsAuthenticated(true);
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<MeResponse & { token: string }>('/auth/login', { email, password });
    setToken(res.token);
    setUserEmail(res.data.email);
    setUserRole(res.data.role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearToken();
    setIsAuthenticated(false);
    setUserRole(null);
    setUserEmail('');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, userRole, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
