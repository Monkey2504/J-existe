
// Profile related types
export interface Profile {
  id: string;
  publicId: string;
  name: string;
  image_url?: string; // URL de la photo ou illustration
  donation_url?: string; // Lien Stripe ou cagnotte
  raw_story: string;
  reformulated_story: string;
  needs: string;
  urgent_needs?: string[]; // Liste des besoins marqués comme urgents
  usual_place: string;
  is_public: boolean;
  is_archived: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
  views?: number;
  needs_clicks?: number;
  shares_count?: number;
}

export interface LieuGroupe {
  nom: string;
  description: string;
  profils: Profile[];
  count: number;
  urgentCount: number;
}

// User & Auth related types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'social_worker' | 'viewer';
  created_at: string;
  last_login: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  email: string;
  password?: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  message?: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => void;
  register: (data: RegisterData) => Promise<AuthResponse>;
  updateUser: (updates: Partial<User>) => Promise<AuthResponse>;
  hasRole: (role: User['role'] | User['role'][]) => boolean;
  refreshSession: () => void;
  resetSession: () => void;
}
