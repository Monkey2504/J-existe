
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
// Fixed: Corrected type names imported from types.ts
import { Utilisateur, EtatAuthentification, TypeContexteAuthentification, IdentifiantsConnexion, DonneesInscription, ReponseAuthentification } from '../types';

// Données mock pour la démo
// Fixed: Aligned roles with the Utilisateur type definition
const MOCK_USERS: Utilisateur[] = [
  {
    id: '1',
    email: 'admin@jexiste.org',
    name: 'Admin Principal',
    role: 'admin',
    created_at: '2024-01-01',
    last_login: new Date().toISOString()
  },
  {
    id: '2',
    email: 'social@jexiste.org',
    name: 'Travailleur Social',
    role: 'travailleur_social',
    created_at: '2024-01-15',
    last_login: new Date().toISOString()
  },
  {
    id: '3',
    email: 'viewer@jexiste.org',
    name: 'Observateur',
    role: 'observateur',
    created_at: '2024-02-01',
    last_login: new Date().toISOString()
  }
];

// Clés de stockage
const AUTH_TOKEN_KEY = 'jexiste_auth_token';
const USER_DATA_KEY = 'jexiste_user_data';
const SESSION_TIMEOUT_KEY = 'jexiste_session_timeout';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

// Fixed: Using the correct Context Type
const AuthContext = createContext<TypeContexteAuthentification | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Fixed: Using the correct State Type
  const [authState, setAuthState] = useState<EtatAuthentification>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null
  });

  // Fixed: use any to avoid NodeJS namespace error in browser environment
  const [sessionTimer, setSessionTimer] = useState<any>(null);

  // Initialisation : vérifier la session existante
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const userData = localStorage.getItem(USER_DATA_KEY);
        const sessionTimeout = localStorage.getItem(SESSION_TIMEOUT_KEY);

        if (token && userData && sessionTimeout) {
          const timeout = parseInt(sessionTimeout, 10);
          
          // Vérifier si la session est expirée
          if (Date.now() > timeout) {
            logout();
            return;
          }

          const user: Utilisateur = JSON.parse(userData);
          
          // Mettre à jour le dernier login
          const updatedUser = { ...user, last_login: new Date().toISOString() };
          localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));

          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: updatedUser,
            error: null
          });

          // Démarrer le timer de session
          startSessionTimer(timeout);
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Erreur d\'initialisation de l\'authentification:', error);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
        localStorage.removeItem(SESSION_TIMEOUT_KEY);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: null
        });
      }
    };

    initializeAuth();
  }, []);

  const startSessionTimer = useCallback((timeout: number) => {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }

    const timeUntilTimeout = timeout - Date.now();
    if (timeUntilTimeout > 0) {
      const timer = setTimeout(() => {
        logout();
        setAuthState(prev => ({
          ...prev,
          error: 'Votre session a expiré. Veuillez vous reconnecter.'
        }));
      }, timeUntilTimeout);

      setSessionTimer(timer);
    }
  }, [sessionTimer]);

  const resetSession = useCallback(() => {
    const newTimeout = Date.now() + SESSION_DURATION;
    localStorage.setItem(SESSION_TIMEOUT_KEY, newTimeout.toString());
    startSessionTimer(newTimeout);
  }, [startSessionTimer]);

  // Fixed: Using the correct response type
  const login = useCallback(async (credentials: IdentifiantsConnexion): Promise<ReponseAuthentification> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 800));

      // Trouver l'utilisateur
      const user = MOCK_USERS.find(
        u => u.email === credentials.email 
      );

      if (!user) {
        throw new Error('Identifiants incorrects');
      }

      // Vérifier le mot de passe (en production, utiliser bcrypt)
      if (credentials.password !== 'demo123') {
        throw new Error('Mot de passe incorrect');
      }

      // Générer un token mock (en production, utiliser JWT)
      const token = btoa(`${user.id}:${Date.now()}:${Math.random().toString(36)}`);
      
      // Mettre à jour le dernier login
      const updatedUser = { ...user, last_login: new Date().toISOString() };
      
      // Sauvegarder dans le localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
      
      const sessionTimeout = Date.now() + SESSION_DURATION;
      localStorage.setItem(SESSION_TIMEOUT_KEY, sessionTimeout.toString());
      
      // Démarrer le timer de session
      startSessionTimer(sessionTimeout);

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: updatedUser,
        error: null
      });

      return {
        success: true,
        user: updatedUser,
        token,
        message: 'Connexion réussie'
      };

    } catch (error: any) {
      const errorMessage = error.message || 'Erreur de connexion';
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    }
  }, [startSessionTimer]);

  // Fixed: Using the correct response type
  const register = useCallback(async (data: DonneesInscription): Promise<ReponseAuthentification> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Vérifier si l'email existe déjà
      const existingUser = MOCK_USERS.find(u => u.email === data.email);
      if (existingUser) {
        throw new Error('Un compte existe déjà avec cet email');
      }

      // Créer un nouvel utilisateur
      const newUser: Utilisateur = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: data.email,
        name: data.name,
        role: 'observateur', // Par défaut, rôle observateur
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };

      // Générer un token
      const token = btoa(`${newUser.id}:${Date.now()}:${Math.random().toString(36)}`);
      
      // Sauvegarder dans le localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(newUser));
      
      const sessionTimeout = Date.now() + SESSION_DURATION;
      localStorage.setItem(SESSION_TIMEOUT_KEY, sessionTimeout.toString());
      
      // Démarrer le timer de session
      startSessionTimer(sessionTimeout);

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: newUser,
        error: null
      });

      return {
        success: true,
        user: newUser,
        token,
        message: 'Inscription réussie'
      };

    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de l\'inscription';
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    }
  }, [startSessionTimer]);

  const logout = useCallback(() => {
    // Nettoyer le localStorage
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(SESSION_TIMEOUT_KEY);
    
    // Arrêter le timer de session
    if (sessionTimer) {
      clearTimeout(sessionTimer);
      setSessionTimer(null);
    }
    
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null
    });
  }, [sessionTimer]);

  // Fixed: Using the correct response type
  const updateUser = useCallback(async (updates: Partial<Utilisateur>): Promise<ReponseAuthentification> => {
    try {
      if (!authState.user) {
        throw new Error('Utilisateur non connecté');
      }

      const updatedUser = { ...authState.user, ...updates };
      
      // Sauvegarder dans le localStorage
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));

      return {
        success: true,
        user: updatedUser,
        message: 'Profil mis à jour avec succès'
      };

    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de la mise à jour';
      setAuthState(prev => ({ ...prev, error: errorMessage }));

      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    }
  }, [authState.user]);

  const hasRole = useCallback((role: Utilisateur['role'] | Utilisateur['role'][]): boolean => {
    if (!authState.user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(authState.user.role);
    }
    
    return authState.user.role === role;
  }, [authState.user]);

  const refreshSession = useCallback(() => {
    if (authState.isAuthenticated) {
      resetSession();
    }
  }, [authState.isAuthenticated, resetSession]);

  // Rafraîchir automatiquement la session sur les interactions utilisateur
  useEffect(() => {
    const handleUserActivity = () => {
      if (authState.isAuthenticated) {
        resetSession();
      }
    };

    // Écouter les événements utilisateur
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
    };
  }, [authState.isAuthenticated, resetSession]);

  // Fixed: Using the correct Context Value Type
  const value: TypeContexteAuthentification = {
    ...authState,
    login,
    logout,
    register,
    updateUser,
    hasRole,
    refreshSession,
    resetSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): TypeContexteAuthentification => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

// Hook personnalisé pour protéger les routes par rôle
export const useRequireAuth = (requiredRole?: Utilisateur['role'] | Utilisateur['role'][]) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();

  if (isLoading) {
    return { loading: true, authorized: false };
  }

  if (!isAuthenticated || !user) {
    return { loading: false, authorized: false, redirectTo: '/login' };
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return { loading: false, authorized: false, redirectTo: '/unauthorized' };
  }

  return { loading: false, authorized: true, user };
};

// Fonction pour valider le format d'email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Fonction pour valider la force du mot de passe
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
