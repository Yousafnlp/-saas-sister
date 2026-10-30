'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Permission } from '@daesthetics/shared';
import { api, ApiError, getToken, setToken, clearToken } from '@/lib/api';

/** 'Admin', 'Manager', 'Staff' or the name of a custom role. */
type UserRole = string | null;

export interface MeResponse {
  success: boolean;
  data: { id: string; name: string; email: string; role: string; permissions: Permission[] };
}

export type AuthResponse = MeResponse & { token: string };

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: UserRole;
  userEmail: string;
  /** Whether the signed-in user's role has this permission. Admins have them all. */
  can: (permission: Permission) => boolean;
  login: (email: string, password: string) => Promise<void>;
  /** Starts a session from a token the API already issued, e.g. after accepting an invite. */
  signIn: (res: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userEmail, setUserEmail] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([]);

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
        setPermissions(res.data.permissions);
        setIsAuthenticated(true);
      })
      .catch((err) => {
        // Only a rejected token ends the session. A rate limit or network blip must not sign people out:
        // the token is kept, so the next page load signs them straight back in.
        if (err instanceof ApiError && err.status === 401) clearToken();
      })
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = (res: AuthResponse) => {
    setToken(res.token);
    setUserEmail(res.data.email);
    setUserRole(res.data.role);
    setPermissions(res.data.permissions);
    setIsAuthenticated(true);
  };

  const login = async (email: string, password: string) => {
    signIn(await api.post<AuthResponse>('/auth/login', { email, password }));
  };

  const logout = () => {
    clearToken();
    setIsAuthenticated(false);
    setUserRole(null);
    setUserEmail('');
    setPermissions([]);
  };

  const can = (permission: Permission) => permissions.includes(permission);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, userRole, userEmail, can, login, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
