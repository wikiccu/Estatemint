'use client';

import { ApiError, authApi } from '@/lib/api';
import type { User } from '@/types/api';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const storageKey = 'estatemint.access-token';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(storageKey);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const storedToken = sessionStorage.getItem(storageKey);

    if (!storedToken) {
      queueMicrotask(() => setIsLoading(false));
      return;
    }

    queueMicrotask(() => setToken(storedToken));
    authApi
      .me(storedToken)
      .then(setUser)
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
        }
      })
      .finally(() => setIsLoading(false));
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    sessionStorage.setItem(storageKey, result.accessToken);
    setToken(result.accessToken);
    setUser(result.user);
  }, []);

  const register = useCallback(
    async (input: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      await authApi.register(input);
      await login(input.email, input.password);
    },
    [login],
  );

  const value = useMemo(
    () => ({ user, token, isLoading, login, register, logout: clearSession }),
    [user, token, isLoading, login, register, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (value === undefined) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return value;
}
