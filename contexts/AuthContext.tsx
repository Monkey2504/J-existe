
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Utilisateur, EtatAuthentification, TypeContexteAuthentification, IdentifiantsConnexion, DonneesInscription, ReponseAuthentification } from '../types.ts';

const MOCK_USERS: Utilisateur[] = [
  { id: '1', email: 'admin@jexiste.org', name: 'Admin Principal', role: 'admin', created_at: '2024-01-01', last_login: new Date().toISOString() },
  { id: '2', email: 'social@jexiste.org', name: 'Travailleur Social', role: 'travailleur_social', created_at: '2024-01-15', last_login: new Date().toISOString() }
];

const AUTH_TOKEN_KEY = 'jexiste_auth_token';
const USER_DATA_KEY = 'jexiste_user_data';
const SESSION_TIMEOUT_KEY = 'jexiste_session_timeout';
const SESSION_DURATION = 24 * 60 * 60 * 1000;

const AuthContext = createContext<TypeContexteAuthentification | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<EtatAuthentification>({ isAuthenticated: false, isLoading: true, user: null, error: null });
  const [sessionTimer, setSessionTimer] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userData = localStorage.getItem(USER_DATA_KEY);
    if (token && userData) {
      setAuthState({ isAuthenticated: true, isLoading: false, user: JSON.parse(userData), error: null });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (credentials: IdentifiantsConnexion): Promise<ReponseAuthentification> => {
    const user = MOCK_USERS.find(u => u.email === credentials.email);
    if (user) {
      localStorage.setItem(AUTH_TOKEN_KEY, 'fake-token');
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      setAuthState({ isAuthenticated: true, isLoading: false, user, error: null });
      return { success: true, user };
    }
    return { success: false, error: 'Identifiants invalides' };
  };

  const logout = () => {
    localStorage.clear();
    setAuthState({ isAuthenticated: false, isLoading: false, user: null, error: null });
  };

  const value: TypeContexteAuthentification = { ...authState, login, logout, register: async () => ({ success: false }), updateUser: async () => ({ success: false }), hasRole: (role) => authState.user?.role === role, refreshSession: () => {}, resetSession: () => {} };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
