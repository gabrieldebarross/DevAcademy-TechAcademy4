'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '@/services/api';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  restoring: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function parseStoredUser(raw: string | null): User | null {
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = parseStoredUser(
      window.localStorage.getItem(USER_STORAGE_KEY),
    );
    setToken(storedToken);
    setUser(storedUser);
    setRestoring(false);
  }, []);

  const signIn = useCallback((newToken: string, newUser: User) => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  const updateUser = useCallback((newUser: User) => {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, restoring, signIn, signOut, updateUser }),
    [user, token, restoring, signIn, signOut, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
