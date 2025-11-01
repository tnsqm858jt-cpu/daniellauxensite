import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { UserProfile } from '../types/user';

type AuthMode = 'login' | 'register';

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  authenticate: (mode: AuthMode, payload: Record<string, string>) => Promise<void>;
  loginWithGoogle: (email: string, name?: string, avatarUrl?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('storylab:token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem('storylab:token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  const authenticate = useCallback(async (mode: AuthMode, payload: Record<string, string>) => {
    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
    const { data } = await api.post(endpoint, payload);
    localStorage.setItem('storylab:token', data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const loginWithGoogle = useCallback(async (email: string, name?: string, avatarUrl?: string) => {
    const { data } = await api.post('/auth/google', { email, name, avatarUrl });
    localStorage.setItem('storylab:token', data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('storylab:token');
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    const { data } = await api.get('/auth/me');
    setUser(data.user);
  }, [token]);

  const updateProfile = useCallback(async (payload: Partial<UserProfile>) => {
    const { data } = await api.put('/profile', payload);
    setUser(data.user);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, authenticate, loginWithGoogle, logout, refreshProfile, updateProfile }),
    [user, token, loading, authenticate, loginWithGoogle, logout, refreshProfile, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
