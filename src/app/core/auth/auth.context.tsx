import { createContext, useContext, useReducer, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { User } from './user.model';
import { jwtService } from './jwt.service';
import api from '../api';

export type AuthState = 'authenticated' | 'unauthenticated' | 'unavailable' | 'loading';

interface AuthData {
  authState: AuthState;
  user: User | null;
}

type AuthAction =
  | { type: 'SET_AUTH'; user: User }
  | { type: 'PURGE_AUTH' }
  | { type: 'SET_UNAVAILABLE' }
  | { type: 'SET_LOADING' };

function authReducer(state: AuthData, action: AuthAction): AuthData {
  switch (action.type) {
    case 'SET_AUTH':
      return { authState: 'authenticated', user: action.user };
    case 'PURGE_AUTH':
      return { authState: 'unauthenticated', user: null };
    case 'SET_UNAVAILABLE':
      return { authState: 'unavailable', user: null };
    case 'SET_LOADING':
      return { authState: 'loading', user: null };
    default:
      return state;
  }
}

interface AuthContextValue {
  authState: AuthState;
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (credentials: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  update: (userData: Record<string, unknown>) => Promise<User>;
  purgeAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, { authState: 'loading', user: null });
  const retryAttemptRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelRetry = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const purgeAuth = useCallback(() => {
    cancelRetry();
    retryAttemptRef.current = 0;
    jwtService.destroyToken();
    dispatch({ type: 'PURGE_AUTH' });
  }, [cancelRetry]);

  const setAuth = useCallback(
    (user: User) => {
      cancelRetry();
      retryAttemptRef.current = 0;
      jwtService.saveToken(user.token);
      dispatch({ type: 'SET_AUTH', user });
    },
    [cancelRetry],
  );

  const fetchCurrentUser = useCallback(async () => {
    try {
      const { data } = await api.get<{ user: User }>('/user');
      setAuth(data.user);
    } catch (err: unknown) {
      const error = err as { status?: number };
      const status = error.status ?? 0;
      if (status >= 400 && status < 500) {
        purgeAuth();
      } else {
        dispatch({ type: 'SET_UNAVAILABLE' });
        const delaySeconds = Math.min(2 * Math.pow(2, retryAttemptRef.current), 16);
        retryAttemptRef.current++;
        retryTimerRef.current = setTimeout(() => {
          if (jwtService.getToken()) {
            dispatch({ type: 'SET_LOADING' });
            void fetchCurrentUser();
          }
        }, delaySeconds * 1000);
      }
    }
  }, [setAuth, purgeAuth]);

  useEffect(() => {
    if (jwtService.getToken()) {
      void fetchCurrentUser();
    } else {
      dispatch({ type: 'PURGE_AUTH' });
    }
    return cancelRetry;
  }, [fetchCurrentUser, cancelRetry]);

  useEffect(() => {
    const handler = () => purgeAuth();
    window.addEventListener('auth:purge', handler);
    return () => window.removeEventListener('auth:purge', handler);
  }, [purgeAuth]);

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      const { data } = await api.post<{ user: User }>('/users/login', { user: credentials });
      setAuth(data.user);
    },
    [setAuth],
  );

  const register = useCallback(
    async (credentials: { username: string; email: string; password: string }) => {
      const { data } = await api.post<{ user: User }>('/users', { user: credentials });
      setAuth(data.user);
    },
    [setAuth],
  );

  const logout = useCallback(() => {
    purgeAuth();
  }, [purgeAuth]);

  const update = useCallback(async (userData: Record<string, unknown>): Promise<User> => {
    const { data } = await api.put<{ user: User }>('/user', { user: userData });
    dispatch({ type: 'SET_AUTH', user: data.user });
    return data.user;
  }, []);

  // Set up debug interface
  useEffect(() => {
    window.__conduit_debug__ = {
      getToken: () => jwtService.getToken(),
      getAuthState: () => state.authState,
      getCurrentUser: () => state.user,
    };
  }, [state.authState, state.user]);

  const value: AuthContextValue = {
    authState: state.authState,
    user: state.user,
    isAuthenticated: state.authState === 'authenticated',
    login,
    register,
    logout,
    update,
    purgeAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
