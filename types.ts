
// Types liés aux profils
export interface Profil {
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

export interface Commentaire {
  id: string;
  profile_public_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface LieuGroupe {
  nom: string;
  description: string;
  profils: Profil[];
  count: number;
  urgentCount: number;
}

// Types liés à l'utilisateur et à l'authentification
export interface Utilisateur {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'travailleur_social' | 'observateur';
  created_at: string;
  last_login: string;
}

export interface EtatAuthentification {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Utilisateur | null;
  error: string | null;
}

export interface IdentifiantsConnexion {
  email: string;
  password?: string;
}

export interface DonneesInscription {
  email: string;
  password?: string;
  name: string;
}

export interface ReponseAuthentification {
  success: boolean;
  user?: Utilisateur;
  token?: string;
  error?: string;
  message?: string;
}

export interface TypeContexteAuthentification extends EtatAuthentification {
  login: (credentials: IdentifiantsConnexion) => Promise<ReponseAuthentification>;
  logout: () => void;
  register: (data: DonneesInscription) => Promise<ReponseAuthentification>;
  updateUser: (updates: Partial<Utilisateur>) => Promise<ReponseAuthentification>;
  hasRole: (role: Utilisateur['role'] | Utilisateur['role'][]) => boolean;
  refreshSession: () => void;
  resetSession: () => void;
}
