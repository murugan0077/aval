import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, setToken, getToken } from '../services/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  professional: any | null;
  loading: boolean;
  login: (phone: string, password: string, loginRole?: string) => Promise<void>;
  register: (name: string, phone: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [professional, setProfessional] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (getToken()) {
      api.getMe()
        .then((data) => {
          setUser(data);
          setProfessional(data.professional || null);
        })
        .catch(() => {
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (phone: string, password: string, loginRole?: string) => {
    const res = await api.login({ phone, password });
    
    if (loginRole && res.user.role !== loginRole) {
      // throw new Error(`This account is registered as a ${res.user.role.toLowerCase()}. Please select the correct role.`);
      throw new Error(`Please select the correct role`);
    }

    setToken(res.token);
    setUser(res.user);
    if (res.user.role === 'PROFESSIONAL') {
      const me = await api.getMe();
      setProfessional(me.professional);
    }
  };

  const register = async (name: string, phone: string, password: string, role?: string) => {
    const res = await api.register({ name, phone, password, role });
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setProfessional(null);
  };

  const refreshProfile = async () => {
    if (!getToken()) return;
    try {
      const data = await api.getMe();
      setUser(data);
      setProfessional(data.professional || null);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, professional, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
