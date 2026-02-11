
// types/index.ts
export interface Profile {
  id: string;
  publicId: string;
  name: string;
  nom?: string; // alias for French components
  raw_story: string;
  reformulated_story: string;
  recit_reformule?: string; // alias for French components
  needs: string;
  besoins_immediats?: string[]; // alias for French components
  immediate_needs?: string[]; // alias for Admin Dashboard
  usual_place: string;
  lieu_habituel?: string; // alias for French components
  is_public: boolean;
  is_archived: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
  
  // Champs étendus (optionnels, pour le mock Supabase)
  views?: number;
  last_viewed?: string;
  version?: number;
  metadata?: ProfileMetadata;
}

export interface ProfileMetadata {
  qr_downloads: number;
  link_shares: number;
  last_updated_by?: string;
  tags: string[];
  urgency_score: number; // 1-10
  verification_status: 'pending' | 'verified' | 'needs_review';
  age?: number;
  gender?: string;
  languages?: string[];
  contact_phone?: string;
  contact_email?: string;
  immediate_needs?: string[];
  reformulation_date?: string;
}

export interface ProfileFormData {
  name: string;
  raw_story: string;
  reformulated_story: string;
  needs: string;
  usual_place: string;
  is_public: boolean;
  is_archived?: boolean;
  is_verified?: boolean;
  metadata?: Partial<ProfileMetadata>;
}

export interface ProfileUpdateData extends Partial<ProfileFormData> {
  id?: string;
  publicId?: string;
}

export interface ProfileStats {
  total: {
    profiles: number;
    views: number;
    qr_downloads: number;
    public_profiles: number;
    archived_profiles: number;
    urgent_profiles: number;
    verified_profiles: number;
  };
  daily: {
    [date: string]: {
      views: number;
      qr_downloads: number;
      profile_views: number;
      new_profiles: number;
    };
  };
  trends?: {
    views_change: number;
    new_profiles_change: number;
  };
}

export interface ProfileFilters {
  search?: string;
  is_public?: boolean;
  is_archived?: boolean;
  is_verified?: boolean;
  usual_place?: string;
  tags?: string[];
  urgency_min?: number;
  urgency_max?: number;
  date_from?: string;
  date_to?: string;
}

export interface ProfileSortOptions {
  field: 'name' | 'created_at' | 'updated_at' | 'views' | 'urgency';
  order: 'asc' | 'desc';
}

export interface ProfileSearchResult {
  query: string;
  results: Profile[];
  count: number;
  took: number;
}

export interface GroupedProfiles {
  [place: string]: Profile[];
}

export interface LieuGroupe {
  nom: string;
  description: string;
  profils: Profile[];
  count: number;
  urgentCount: number;
  coordonnees?: { lat: number; lng: number };
}

export interface FilterState {
  search: string;
  lieu: string | null;
  urgentOnly: boolean;
  needs: string[];
  sortBy: 'recent' | 'name' | 'urgent' | 'location';
  viewMode: 'grid' | 'map' | 'list';
}

// Types pour le service Gemini
export interface ReformulationConfig {
  maxLength?: number;
  temperature?: number;
  preserveEmotion?: boolean;
  language?: 'fr' | 'en';
}

export interface ReformulationResult {
  success: boolean;
  text: string;
  error?: string;
  stats?: {
    originalLength: number;
    reformulatedLength: number;
    charactersSaved?: number;
    processingTime?: number;
  };
}

// Types pour l'authentification
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'social_worker' | 'viewer';
  created_at: string;
  last_login?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
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

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User | null;
  token?: string;
  error?: string;
  message?: string;
}

// Types pour les QR Codes
export interface QRCodeData {
  profileId: string;
  profileName: string;
  url: string;
  downloads: number;
  created_at: string;
  last_downloaded?: string;
}

// Types pour les dons
export interface Donation {
  id: string;
  profileId: string;
  donorEmail: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  metadata?: {
    needs_supported?: string[];
    message?: string;
    anonymous: boolean;
  };
}

// Types pour le log d'audit
export interface AuditLogEntry {
  id: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'archive' | 'view' | 'qr_download' | 'restore' | 'import' | 'export';
  profileId: string;
  profileName: string;
  userId?: string;
  userRole?: string;
  timestamp: string;
  changes?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

// Types pour les backups
export interface BackupData {
  id: string;
  timestamp: string;
  count: number;
  reason: 'auto' | 'manual' | 'before_migration';
  version: number;
  data: Profile[];
}

// Types pour les exports
export interface ExportOptions {
  format: 'json' | 'csv';
  includePrivate?: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}

// Types pour la géolocalisation
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

// Types pour les notifications
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Types pour les composants UI
export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType;
  count?: number;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ComponentType;
}

// Types pour les formulaires
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Types utilitaires
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & { [K in Keys]-?: Required<Pick<T, K>> }[Keys];

// Types pour les événements
export interface ProfileEvent {
  id: string;
  type: 'view' | 'qr_download' | 'share' | 'donation' | 'update';
  profileId: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
  metadata?: Record<string, any>;
}

// Types pour les rapports
export interface ReportData {
  period: {
    start: string;
    end: string;
  };
  totalProfiles: number;
  newProfiles: number;
  totalViews: number;
  qrDownloads: number;
  topProfiles: Array<{
    profileId: string;
    profileName: string;
    views: number;
    downloads: number;
  }>;
  urgentNeeds: string[];
  locations: Array<{
    place: string;
    count: number;
  }>;
}

// Enums
export enum ProfileStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  PENDING = 'pending'
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  NEEDS_REVIEW = 'needs_review'
}

export enum UrgencyLevel {
  LOW = 1,
  MEDIUM = 5,
  HIGH = 8,
  CRITICAL = 10
}

// Helper types
export type ProfileWithMetadata = Profile & { metadata: ProfileMetadata };
export type ProfileWithStats = Profile & { views: number; last_viewed: string };
export type ProfileExport = Omit<Profile, 'metadata' | 'views' | 'last_viewed'>;

// Type guards
export const isProfileWithMetadata = (profile: Profile): profile is ProfileWithMetadata => {
  return !!profile.metadata;
};

export const isProfileWithStats = (profile: Profile): profile is ProfileWithStats => {
  return profile.views !== undefined && profile.last_viewed !== undefined;
};

// Default values
export const DEFAULT_PROFILE_FORM_DATA: ProfileFormData = {
  name: '',
  raw_story: '',
  reformulated_story: '',
  needs: '',
  usual_place: '',
  is_public: false,
  is_archived: false,
  is_verified: false,
  metadata: {
    qr_downloads: 0,
    link_shares: 0,
    tags: [],
    urgency_score: 5,
    verification_status: 'pending'
  }
};

export const DEFAULT_REFORMULATION_CONFIG: ReformulationConfig = {
  maxLength: 500,
  temperature: 0.7,
  preserveEmotion: true,
  language: 'fr'
};

// Constantes
export const MAX_STORY_LENGTH = 5000;
export const MAX_REFORMULATED_LENGTH = 500;
export const MIN_STORY_LENGTH = 10;

// Validation functions
export const validateProfile = (profile: Partial<ProfileFormData>): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!profile.name?.trim()) {
    errors.name = 'Le nom est obligatoire';
  }

  if (!profile.raw_story?.trim()) {
    errors.raw_story = 'Le récit brut est obligatoire';
  } else if (profile.raw_story.length < MIN_STORY_LENGTH) {
    errors.raw_story = `Le récit doit contenir au moins ${MIN_STORY_LENGTH} caractères`;
  } else if (profile.raw_story.length > MAX_STORY_LENGTH) {
    errors.raw_story = `Le récit ne peut pas dépasser ${MAX_STORY_LENGTH} caractères`;
  }

  if (!profile.reformulated_story?.trim()) {
    errors.reformulated_story = 'La version reformulée est obligatoire';
  } else if (profile.reformulated_story.length > MAX_REFORMULATED_LENGTH) {
    errors.reformulated_story = `La version reformulée ne peut pas dépasser ${MAX_REFORMULATED_LENGTH} caractères`;
  }

  if (!profile.usual_place?.trim()) {
    errors.usual_place = 'Le lieu habituel est obligatoire';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const generatePublicId = (name: string): string => {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  const random = Math.random().toString(36).substr(2, 6);
  return `${base}-${random}`;
};
