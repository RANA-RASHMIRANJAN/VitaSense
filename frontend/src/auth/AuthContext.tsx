import React, { createContext, useContext, useMemo, useState } from 'react';

type User = { id: string; email: string };

type AuthState = {
  token: string | null;
  user: User | null;
};

type AuthContextValue = AuthState & {
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'vitamin_auth';

function loadInitial(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw) as AuthState;
    return { token: parsed.token || null, user: parsed.user || null };
  } catch {
    return { token: null, user: null };
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => loadInitial());

  const value = useMemo<AuthContextValue>(() => {
    return {
      token: state.token,
      user: state.user,
      login: (token, user) => {
        const next = { token, user };
        setState(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      },
      logout: () => {
        setState({ token: null, user: null });
        localStorage.removeItem(STORAGE_KEY);
      },
    };
  }, [state.token, state.user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

