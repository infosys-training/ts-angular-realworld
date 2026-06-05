import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { User } from './user.model';

export type AuthState = 'authenticated' | 'unauthenticated' | 'unavailable' | 'loading';

interface AuthContextValue {
  user: User | null;
  authState: AuthState;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ user: User }>;
  register: (credentials: { username: string; email: string; password: string }) => Promise<{ user: User }>;
  logout: () => void;
  update: (user: Partial<User>) => Promise<{ user: User }>;
  purgeAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const retryAttempt = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const cancelRetry = useCallback(() => {
    if (retryTimer.current) {
      clearTimeout(retryTimer.current);
      retryTimer.current = null;
    }
  }, []);

  const setAuth = useCallback(
    (u: User) => {
      cancelRetry();
      retryAttempt.current = 0;
      window.localStorage.setItem('jwtToken', u.token);
      setUser(u);
      setAuthState('authenticated');
    },
    [cancelRetry],
  );

  const purgeAuth = useCallback(() => {
    cancelRetry();
    retryAttempt.current = 0;
    window.localStorage.removeItem('jwtToken');
    setUser(null);
    setAuthState('unauthenticated');
  }, [cancelRetry]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const data = await api.get<{ user: User }>('/user');
      setAuth(data.user);
    } catch (err: unknown) {
      const status = (err as { status?: number }).status ?? 0;
      if (status >= 400 && status < 500) {
        purgeAuth();
      } else {
        setUser(null);
        setAuthState('unavailable');
        const delay = Math.min(2 * Math.pow(2, retryAttempt.current), 16);
        retryAttempt.current++;
        retryTimer.current = setTimeout(() => {
          const token = window.localStorage.getItem('jwtToken');
          if (token) {
            setAuthState('loading');
            void fetchCurrentUser();
          }
        }, delay * 1000);
      }
    }
  }, [setAuth, purgeAuth]);

  useEffect(() => {
    const token = window.localStorage.getItem('jwtToken');
    if (token) {
      void fetchCurrentUser();
    } else {
      purgeAuth();
    }
    return cancelRetry;
  }, [fetchCurrentUser, purgeAuth, cancelRetry]);

  // Setup debug interface
  useEffect(() => {
    window.__conduit_debug__ = {
      getToken: () => window.localStorage.getItem('jwtToken'),
      getAuthState: () => authState,
      getCurrentUser: () => user,
    };
  }, [user, authState]);

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      const data = await api.post<{ user: User }>('/users/login', {
        user: credentials,
      });
      setAuth(data.user);
      return data;
    },
    [setAuth],
  );

  const register = useCallback(
    async (credentials: { username: string; email: string; password: string }) => {
      const data = await api.post<{ user: User }>('/users', {
        user: credentials,
      });
      setAuth(data.user);
      return data;
    },
    [setAuth],
  );

  const logout = useCallback(() => {
    purgeAuth();
    navigate('/');
  }, [purgeAuth, navigate]);

  const update = useCallback(async (userData: Partial<User>) => {
    const data = await api.put<{ user: User }>('/user', { user: userData });
    setUser(data.user);
    return data;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        authState,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        update,
        purgeAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Debug interface type declaration
declare global {
  interface Window {
    __conduit_debug__?: {
      getToken: () => string | null;
      getAuthState: () => AuthState;
      getCurrentUser: () => User | null;
    };
  }
}
