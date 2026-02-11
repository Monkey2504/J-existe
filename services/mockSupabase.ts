
import { Profile, ProfileStats, ProfileFilters, ProfileUpdateData, ProfileSortOptions, ProfileSearchResult } from '../types';

// Configuration
const STORAGE_KEY = 'jexiste_profiles_v2';
const STORAGE_STATS_KEY = 'jexiste_profiles_stats';
const STORAGE_BACKUPS_KEY = 'jexiste_profiles_backups';
const STORAGE_AUDIT_LOG_KEY = 'jexiste_audit_log';
const MAX_BACKUPS = 10;
const AUTO_SAVE_INTERVAL = 60000; // 1 minute en millisecondes

// Types internes
interface ExtendedProfile extends Profile {
  views: number;
  last_viewed?: string;
  version: number;
  metadata?: {
    qr_downloads: number;
    link_shares: number;
    last_updated_by?: string;
    tags: string[];
    urgency_score: number; // 1-10
    verification_status: 'pending' | 'verified' | 'needs_review';
    immediate_needs?: string[];
  };
}

interface AuditLogEntry {
  id: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'archive' | 'view' | 'qr_download' | 'restore' | 'import';
  profileId: string;
  profileName: string;
  userId?: string;
  userRole?: string;
  timestamp: string;
  changes?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

interface BackupData {
  id: string;
  timestamp: string;
  count: number;
  reason: 'auto' | 'manual' | 'before_migration';
  version: number;
  data: ExtendedProfile[];
}

// Données initiales enrichies
const initialProfiles: ExtendedProfile[] = [
  {
    id: '1',
    publicId: 'jean-place-rep',
    name: 'Jean',
    nom: 'Jean',
    raw_story: "Je suis à la rue depuis 5 ans après avoir perdu mon boulot de menuisier. J'aime bien le quartier parce que les gens sont sympas. Je parle avec les commerçants et parfois ils me donnent du café. J'ai appris à réparer des petits meubles avec les outils que j'ai pu garder.",
    reformulated_story: "Ancien menuisier, Jean habite le quartier depuis cinq ans. Il y a tissé des liens précieux avec les passants, trouvant dans la bienveillance des riverains une forme de foyer à ciel ouvert.",
    recit_reformule: "Ancien menuisier, Jean habite le quartier depuis cinq ans.",
    needs: "- Un sac de couchage chaud\n- Des outils de petite menuiserie\n- Quelques tickets de métro\n- Des chaussures de marche taille 43\n- Une trousse de secours\n- Des produits d'hygiène de base",
    besoins_immediats: ["Un sac de couchage chaud", "Des outils de petite menuiserie"],
    immediate_needs: ["Un sac de couchage chaud", "Des outils de petite menuiserie"],
    usual_place: "Place de la République, Paris",
    lieu_habituel: "Place de la République, Paris",
    is_public: true,
    is_archived: false,
    is_verified: true,
    created_at: new Date('2023-11-15').toISOString(),
    updated_at: new Date('2024-03-01').toISOString(),
    views: 124,
    last_viewed: new Date('2024-03-10').toISOString(),
    version: 3,
    metadata: {
      qr_downloads: 18,
      link_shares: 32,
      last_updated_by: 'social_worker_1',
      tags: ['artisan', 'menuiserie', 'paris', 'ancien_travailleur'],
      urgency_score: 6,
      verification_status: 'verified',
      immediate_needs: ["Un sac de couchage chaud", "Des outils de petite menuiserie"]
    }
  },
  {
    id: '2',
    publicId: 'marie-canal',
    name: 'Marie',
    nom: 'Marie',
    raw_story: "Je m'appelle Marie, j'ai mon chien avec moi. On est souvent au bord du canal de l'Ourcq. J'ai dû quitter mon logement il y a deux ans suite à une séparation difficile. Mon chien est ma seule famille maintenant.",
    reformulated_story: "Accompagnée de son fidèle compagnon à quatre pattes, Marie chemine le long du Canal de l'Ourcq. Leur complicité est leur plus grande force face aux aléas de la rue.",
    recit_reformule: "Accompagnée de son fidèle compagnon à quatre pattes, Marie chemine le long du Canal de l'Ourcq.",
    needs: "- Croquettes pour chien (marque Royal Canin)\n- Un manteau imperméable (taille M)\n- Un thermos\n- Des médicaments pour arthrose (pour elle)\n- Une laisse solide\n- De la nourriture en conserve",
    besoins_immediats: ["Croquettes pour chien", "Un manteau imperméable"],
    immediate_needs: ["Croquettes pour chien", "Un manteau imperméable"],
    usual_place: "Canal de l'Ourcq, Pantin",
    lieu_habituel: "Canal de l'Ourcq, Pantin",
    is_public: true,
    is_archived: false,
    is_verified: true,
    created_at: new Date('2023-12-10').toISOString(),
    updated_at: new Date('2024-02-28').toISOString(),
    views: 89,
    last_viewed: new Date('2024-03-08').toISOString(),
    version: 2,
    metadata: {
      qr_downloads: 12,
      link_shares: 21,
      last_updated_by: 'social_worker_2',
      tags: ['animal', 'femme', 'canal', 'isolation'],
      urgency_score: 7,
      verification_status: 'verified',
      immediate_needs: ["Croquettes pour chien", "Un manteau imperméable"]
    }
  },
  {
    id: '3',
    publicId: 'ahmed-gare-lyon',
    name: 'Ahmed',
    nom: 'Ahmed',
    raw_story: "Je dors près de la gare de Lyon. J'aime lire des livres d'histoire. J'ai quitté mon pays il y a trois ans pour des raisons politiques. Je parle français, anglais et arabe. J'aimerais trouver un travail dans la traduction.",
    reformulated_story: "Ahmed, passionné d'histoire, a établi son refuge près de la Gare de Lyon. Entre deux voyages de passants, il s'évade dans les récits du passé, cherchant dans les livres une dignité que le béton ignore.",
    recit_reformule: "Ahmed, passionné d'histoire, a établi son refuge près de la Gare de Lyon.",
    needs: "- Livres d'histoire de France\n- Lampe frontale\n- Chaussettes en laine taille 42-44\n- Un dictionnaire français-arabe\n- Un chargeur de téléphone solaire\n- Des produits d'hygiène",
    besoins_immediats: ["Livres d'histoire", "Lampe frontale"],
    immediate_needs: ["Livres d'histoire", "Lampe frontale"],
    usual_place: "Gare de Lyon, Paris",
    lieu_habituel: "Gare de Lyon, Paris",
    is_public: true,
    is_archived: false,
    is_verified: true,
    created_at: new Date('2024-01-05').toISOString(),
    updated_at: new Date('2024-03-05').toISOString(),
    views: 156,
    last_viewed: new Date('2024-03-12').toISOString(),
    version: 4,
    metadata: {
      qr_downloads: 24,
      link_shares: 45,
      last_updated_by: 'social_worker_1',
      tags: ['migrant', 'étudiant', 'traduction', 'lecture'],
      urgency_score: 5,
      verification_status: 'verified',
      immediate_needs: ["Livres d'histoire", "Lampe frontale"]
    }
  },
  {
    id: '4',
    publicId: 'sophie-parc-monceau',
    name: 'Sophie',
    nom: 'Sophie',
    raw_story: "Je suis dans le parc Monceau depuis quelques mois. Je viens d'une famille aisée mais j'ai tout perdu après des problèmes de santé. Je ne veux pas déranger, je reste discrète.",
    reformulated_story: "Sophie a trouvé refuge au Parc Monceau, préservant une dignité silencieuse malgré les épreuves. Son parcours témoigne de la fragilité des destins, même les plus protégés.",
    recit_reformule: "Sophie a trouvé refuge au Parc Monceau.",
    needs: "- Médicaments pour hypertension\n- Des vêtements chics (taille 38) pour entretiens\n- Une couverture discrète et légère\n- De l'eau minérale\n- Des serviettes hygiéniques",
    besoins_immediats: ["Médicaments", "Vêtements"],
    immediate_needs: ["Médicaments", "Vêtements"],
    usual_place: "Parc Monceau, Paris",
    lieu_habituel: "Parc Monceau, Paris",
    is_public: true,
    is_archived: false,
    is_verified: false,
    created_at: new Date('2024-02-20').toISOString(),
    updated_at: new Date('2024-03-10').toISOString(),
    views: 67,
    last_viewed: new Date('2024-03-11').toISOString(),
    version: 1,
    metadata: {
      qr_downloads: 8,
      link_shares: 15,
      last_updated_by: 'social_worker_3',
      tags: ['santé', 'femme', 'discret', 'parc'],
      urgency_score: 8,
      verification_status: 'pending',
      immediate_needs: ["Médicaments", "Vêtements"]
    }
  },
  {
    id: '5',
    publicId: 'paul-quai-seine',
    name: 'Paul',
    nom: 'Paul',
    raw_story: "Je fais la manche sur les quais de Seine. J'ai 62 ans, ancien ouvrier du bâtiment. Mes enfants ne me parlent plus. Je vis avec ma radio, c'est ma seule compagnie.",
    reformulated_story: "Paul, ancien ouvrier, partage sa solitude avec les flots de la Seine. Sa radio, dernier lien avec le monde, diffuse des échos d'une vie antérieure, plus peuplée.",
    recit_reformule: "Paul, ancien ouvrier, partage sa solitude avec les flots de la Seine.",
    needs: "- Une radio à piles\n- Des piles AA\n- Un matelas gonflable\n- Des lunettes de vue (prescription perdue)\n- Des vêtements de travail taille XL\n- Des conserves",
    besoins_immediats: ["Une radio à piles", "Des piles AA"],
    immediate_needs: ["Une radio à piles", "Des piles AA"],
    usual_place: "Quai de Seine, Paris 4ème",
    lieu_habituel: "Quai de Seine, Paris 4ème",
    is_public: false,
    is_archived: false,
    is_verified: true,
    created_at: new Date('2023-10-30').toISOString(),
    updated_at: new Date('2024-03-01').toISOString(),
    views: 45,
    last_viewed: new Date('2024-02-28').toISOString(),
    version: 2,
    metadata: {
      qr_downloads: 5,
      link_shares: 9,
      last_updated_by: 'social_worker_2',
      tags: ['ancien_ouvrier', 'seul', 'radio', 'quais'],
      urgency_score: 9,
      verification_status: 'verified',
      immediate_needs: ["Une radio à piles", "Des piles AA"]
    }
  }
];

// Helper functions
const getCurrentUser = () => {
  return {
    id: localStorage.getItem('current_user_id') || 'anonymous',
    role: localStorage.getItem('current_user_role') || 'guest',
    name: localStorage.getItem('current_user_name') || 'Utilisateur'
  };
};

const logAudit = (action: AuditLogEntry['action'], profileId: string, profileName: string, changes?: Record<string, any>) => {
  try {
    const user = getCurrentUser();
    const logs: AuditLogEntry[] = JSON.parse(localStorage.getItem(STORAGE_AUDIT_LOG_KEY) || '[]');
    
    const entry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      profileId,
      profileName,
      userId: user.id,
      userRole: user.role,
      timestamp: new Date().toISOString(),
      changes,
      userAgent: navigator.userAgent
    };
    
    logs.unshift(entry); // Ajouter au début
    if (logs.length > 1000) logs.pop(); // Garder seulement les 1000 dernières entrées
    
    localStorage.setItem(STORAGE_AUDIT_LOG_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
};

const createBackup = (reason: BackupData['reason'] = 'auto') => {
  try {
    const profiles = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(initialProfiles));
    const backups: BackupData[] = JSON.parse(localStorage.getItem(STORAGE_BACKUPS_KEY) || '[]');
    
    const backup: BackupData = {
      id: `backup_${Date.now()}`,
      timestamp: new Date().toISOString(),
      count: profiles.length,
      reason,
      version: 2,
      data: profiles
    };
    
    backups.unshift(backup);
    if (backups.length > MAX_BACKUPS) backups.pop();
    
    localStorage.setItem(STORAGE_BACKUPS_KEY, JSON.stringify(backups));
  } catch (error) {
    console.error('Failed to create backup:', error);
  }
};

const updateStats = (action: 'view' | 'create' | 'update' | 'delete' | 'publish' | 'archive' | 'qr_download' | 'restore' | 'import') => {
  try {
    const stats: ProfileStats = JSON.parse(localStorage.getItem(STORAGE_STATS_KEY) || '{}');
    const now = new Date().toISOString().split('T')[0]; // Date du jour
    
    // Initialiser les stats du jour si nécessaire
    if (!stats.daily) stats.daily = {};
    if (!stats.daily[now]) {
      stats.daily[now] = {
        views: 0,
        qr_downloads: 0,
        profile_views: 0,
        new_profiles: 0
      };
    }
    
    // Mettre à jour les stats globales
    // FIX: Initialize with all required properties for ProfileStats.total
    if (!stats.total) stats.total = { profiles: 0, views: 0, qr_downloads: 0, public_profiles: 0, archived_profiles: 0, urgent_profiles: 0, verified_profiles: 0 };
    
    switch (action) {
      case 'view':
        stats.total.views = (stats.total.views || 0) + 1;
        stats.daily[now].views = (stats.daily[now].views || 0) + 1;
        break;
      case 'create':
        stats.total.profiles = (stats.total.profiles || 0) + 1;
        stats.daily[now].new_profiles = (stats.daily[now].new_profiles || 0) + 1;
        break;
      case 'qr_download':
        stats.total.qr_downloads = (stats.total.qr_downloads || 0) + 1;
        stats.daily[now].qr_downloads = (stats.daily[now].qr_downloads || 0) + 1;
        break;
    }
    
    // Calculer les tendances
    const dates = Object.keys(stats.daily).sort();
    if (dates.length >= 2) {
      const yesterday = dates[dates.length - 2];
      const today = dates[dates.length - 1];
      
      stats.trends = {
        views_change: ((stats.daily[today].views - stats.daily[yesterday].views) / stats.daily[yesterday].views * 100) || 0,
        new_profiles_change: ((stats.daily[today].new_profiles - stats.daily[yesterday].new_profiles) / (stats.daily[yesterday].new_profiles || 1) * 100) || 0
      };
    }
    
    localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to update stats:', error);
  }
};

// Initialisation
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProfiles));
    createBackup('before_migration');
  }
  
  // Auto-save backup
  if (!(window as any).__mockSupabaseAutoSave) {
    (window as any).__mockSupabaseAutoSave = setInterval(() => {
      createBackup('auto');
    }, AUTO_SAVE_INTERVAL);
  }
};

// Fonctions principales
export const getProfiles = async (filters?: ProfileFilters, sort?: ProfileSortOptions): Promise<Profile[]> => {
  initializeStorage();
  
  try {
    let profiles: ExtendedProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    // Appliquer les filtres
    if (filters) {
      if (filters.is_public !== undefined) {
        profiles = profiles.filter(p => p.is_public === filters.is_public);
      }
      
      if (filters.is_archived !== undefined) {
        profiles = profiles.filter(p => p.is_archived === filters.is_archived);
      }
      
      if (filters.is_verified !== undefined) {
        profiles = profiles.filter(p => p.is_verified === filters.is_verified);
      }
      
      if (filters.usual_place) {
        profiles = profiles.filter(p => 
          p.usual_place.toLowerCase().includes(filters.usual_place!.toLowerCase())
        );
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        profiles = profiles.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.raw_story.toLowerCase().includes(searchLower) ||
          p.reformulated_story.toLowerCase().includes(searchLower) ||
          p.needs.toLowerCase().includes(searchLower) ||
          p.usual_place.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.tags && filters.tags.length > 0) {
        profiles = profiles.filter(p => 
          filters.tags!.some(tag => p.metadata?.tags?.includes(tag))
        );
      }
      
      if (filters.urgency_min || filters.urgency_max) {
        profiles = profiles.filter(p => {
          const score = p.metadata?.urgency_score || 0;
          return (!filters.urgency_min || score >= filters.urgency_min) &&
                 (!filters.urgency_max || score <= filters.urgency_max);
        });
      }
      
      if (filters.date_from) {
        const fromDate = new Date(filters.date_from);
        profiles = profiles.filter(p => new Date(p.created_at) >= fromDate);
      }
      
      if (filters.date_to) {
        const toDate = new Date(filters.date_to);
        profiles = profiles.filter(p => new Date(p.created_at) <= toDate);
      }
    }
    
    // Appliquer le tri
    if (sort) {
      profiles.sort((a, b) => {
        const direction = sort.order === 'desc' ? -1 : 1;
        
        switch (sort.field) {
          case 'name':
            return direction * a.name.localeCompare(b.name);
          case 'created_at':
            return direction * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          case 'updated_at':
            return direction * (new Date(a.updated_at || a.created_at).getTime() - new Date(b.updated_at || b.created_at).getTime());
          case 'views':
            return direction * ((a.views || 0) - (b.views || 0));
          case 'urgency':
            return direction * ((a.metadata?.urgency_score || 0) - (b.metadata?.urgency_score || 0));
          default:
            return 0;
        }
      });
    }
    
    // Convertir en Profile (sans les champs étendus)
    return profiles.map(p => ({
      id: p.id,
      publicId: p.publicId,
      name: p.name,
      nom: p.name,
      raw_story: p.raw_story,
      reformulated_story: p.reformulated_story,
      recit_reformule: p.reformulated_story,
      needs: p.needs,
      besoins_immediats: p.metadata?.immediate_needs || [],
      immediate_needs: p.metadata?.immediate_needs || [],
      usual_place: p.usual_place,
      lieu_habituel: p.usual_place,
      is_public: p.is_public,
      is_archived: p.is_archived,
      is_verified: p.is_verified,
      created_at: p.created_at,
      updated_at: p.updated_at,
      views: p.views,
      metadata: p.metadata
    } as Profile));
  } catch (error) {
    console.error('Error getting profiles:', error);
    return [];
  }
};

export const getPublicProfiles = async (options?: {
  limit?: number;
  offset?: number;
  sortBy?: 'recent' | 'views' | 'urgency';
}): Promise<Profile[]> => {
  const profiles = await getProfiles({ is_public: true, is_archived: false });
  
  // Trier selon l'option
  if (options?.sortBy) {
    profiles.sort((a, b) => {
      const extendedA = a as ExtendedProfile;
      const extendedB = b as ExtendedProfile;
      
      switch (options.sortBy) {
        case 'views':
          return (extendedB.views || 0) - (extendedA.views || 0);
        case 'urgency':
          return ((extendedB.metadata?.urgency_score || 0) - (extendedA.metadata?.urgency_score || 0));
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }
  
  // Pagination
  const start = options?.offset || 0;
  const end = options?.limit ? start + options.limit : profiles.length;
  
  return profiles.slice(start, end);
};

export const getProfileByPublicId = async (publicId: string, trackView: boolean = true): Promise<Profile | null> => {
  initializeStorage();
  
  try {
    const profiles: ExtendedProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const profile = profiles.find(p => p.publicId === publicId);
    
    if (!profile) return null;
    
    // Mettre à jour les stats de vue
    if (trackView) {
      profile.views = (profile.views || 0) + 1;
      profile.last_viewed = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
      
      updateStats('view');
      logAudit('view', profile.id, profile.name);
    }
    
    // Convertir en Profile
    return {
      id: profile.id,
      publicId: profile.publicId,
      name: profile.name,
      nom: profile.name,
      raw_story: profile.raw_story,
      reformulated_story: profile.reformulated_story,
      recit_reformule: profile.reformulated_story,
      needs: profile.needs,
      besoins_immediats: profile.metadata?.immediate_needs || [],
      immediate_needs: profile.metadata?.immediate_needs || [],
      usual_place: profile.usual_place,
      lieu_habituel: profile.usual_place,
      is_public: profile.is_public,
      is_archived: profile.is_archived,
      is_verified: profile.is_verified,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      views: profile.views,
      metadata: profile.metadata
    } as Profile;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
};

export const saveProfile = async (profileData: ProfileUpdateData): Promise<Profile> => {
  initializeStorage();
  
  try {
    const profiles: ExtendedProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const user = getCurrentUser();
    const now = new Date().toISOString();
    
    let profile: ExtendedProfile;
    let action: 'create' | 'update' = 'create';
    
    if (profileData.id) {
      // Mise à jour
      const index = profiles.findIndex(p => p.id === profileData.id);
      if (index === -1) throw new Error('Profile not found');
      
      const oldProfile = profiles[index];
      profile = {
        ...oldProfile,
        ...profileData,
        updated_at: now,
        version: oldProfile.version + 1,
        metadata: {
          ...oldProfile.metadata,
          last_updated_by: user.id,
          verification_status: profileData.is_verified ? 'verified' : 'pending'
        }
      } as ExtendedProfile;
      
      profiles[index] = profile;
      action = 'update';
      
      // Logger les changements
      const changes: Record<string, any> = {};
      Object.keys(profileData).forEach(key => {
        if ((profileData as any)[key] !== (oldProfile as any)[key]) {
          changes[key] = {
            old: (oldProfile as any)[key],
            new: (profileData as any)[key]
          };
        }
      });
      
      logAudit('update', profile.id, profile.name, changes);
    } else {
      // Création
      const id = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const publicId = profileData.publicId || `${profileData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substr(2, 6)}`;
      
      profile = {
        id,
        publicId,
        name: profileData.name || '',
        nom: profileData.name || '',
        raw_story: profileData.raw_story || '',
        reformulated_story: profileData.reformulated_story || '',
        recit_reformule: profileData.reformulated_story || '',
        needs: profileData.needs || '',
        besoins_immediats: profileData.metadata?.immediate_needs || [],
        immediate_needs: profileData.metadata?.immediate_needs || [],
        usual_place: profileData.usual_place || '',
        lieu_habituel: profileData.usual_place || '',
        is_public: profileData.is_public || false,
        is_archived: profileData.is_archived || false,
        is_verified: profileData.is_verified || false,
        created_at: now,
        updated_at: now,
        views: 0,
        version: 1,
        metadata: {
          qr_downloads: 0,
          link_shares: 0,
          last_updated_by: user.id,
          tags: profileData.metadata?.tags || [],
          urgency_score: profileData.metadata?.urgency_score || 5,
          verification_status: profileData.is_verified ? 'verified' : 'pending',
          immediate_needs: profileData.metadata?.immediate_needs || []
        }
      } as ExtendedProfile;
      
      profiles.push(profile);
      action = 'create';
      
      logAudit('create', id, profile.name);
      updateStats('create');
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    createBackup('manual');
    
    // Convertir en Profile pour le retour
    return {
      id: profile.id,
      publicId: profile.publicId,
      name: profile.name,
      nom: profile.name,
      raw_story: profile.raw_story,
      reformulated_story: profile.reformulated_story,
      recit_reformule: profile.reformulated_story,
      needs: profile.needs,
      besoins_immediats: profile.metadata?.immediate_needs || [],
      immediate_needs: profile.metadata?.immediate_needs || [],
      usual_place: profile.usual_place,
      lieu_habituel: profile.usual_place,
      is_public: profile.is_public,
      is_archived: profile.is_archived,
      is_verified: profile.is_verified,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      views: profile.views,
      metadata: profile.metadata
    } as Profile;
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};

export const deleteProfile = async (id: string): Promise<void> => {
  initializeStorage();
  
  try {
    const profiles: ExtendedProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const profile = profiles.find(p => p.id === id);
    
    if (!profile) throw new Error('Profile not found');
    
    // Sauvegarder dans les archives
    const deletedProfiles = JSON.parse(localStorage.getItem('jexiste_deleted_profiles') || '[]');
    deletedProfiles.push({
      ...profile,
      deleted_at: new Date().toISOString(),
      deleted_by: getCurrentUser().id
    });
    localStorage.setItem('jexiste_deleted_profiles', JSON.stringify(deletedProfiles));
    
    // Supprimer
    const filtered = profiles.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    logAudit('delete', id, profile.name);
    createBackup('manual');
  } catch (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
};

export const toggleProfileVisibility = async (id: string, isPublic: boolean): Promise<void> => {
  initializeStorage();
  
  try {
    const profiles: ExtendedProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const index = profiles.findIndex(p => p.id === id);
    
    if (index === -1) throw new Error('Profile not found');
    
    const oldVisibility = profiles[index].is_public;
    profiles[index].is_public = isPublic;
    profiles[index].updated_at = new Date().toISOString();
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    
    logAudit('publish', id, profiles[index].name, {
      visibility: { old: oldVisibility, new: isPublic }
    });
  } catch (error) {
    console.error('Error toggling visibility:', error);
    throw error;
  }
};

export const incrementProfileView = async (id: string): Promise<void> => {
  initializeStorage();
  
  try {
    const profiles: ExtendedProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const profile = profiles.find(p => p.id === id);
    
    if (profile) {
      profile.views = (profile.views || 0) + 1;
      profile.last_viewed = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
      
      updateStats('view');
    }
  } catch (error) {
    console.error('Error incrementing view:', error);
  }
};

export const incrementQRDownloads = async (id: string): Promise<void> => {
  initializeStorage();
  
  try {
    const profiles: ExtendedProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const profile = profiles.find(p => p.id === id);
    
    if (profile && profile.metadata) {
      profile.metadata.qr_downloads = (profile.metadata.qr_downloads || 0) + 1;
      profile.updated_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
      
      updateStats('qr_download');
      logAudit('qr_download', id, profile.name);
    }
  } catch (error) {
    console.error('Error incrementing QR downloads:', error);
  }
};

export const searchProfiles = async (query: string): Promise<ProfileSearchResult> => {
  const profiles = await getProfiles();
  const queryLower = query.toLowerCase();
  
  const results = profiles.filter(profile => {
    return (
      profile.name.toLowerCase().includes(queryLower) ||
      profile.raw_story.toLowerCase().includes(queryLower) ||
      profile.reformulated_story.toLowerCase().includes(queryLower) ||
      profile.needs.toLowerCase().includes(queryLower) ||
      profile.usual_place.toLowerCase().includes(queryLower)
    );
  });
  
  return {
    query,
    results,
    count: results.length,
    took: 0 // Pour la simulation
  };
};

export const getStats = async (): Promise<ProfileStats> => {
  try {
    const stats: ProfileStats = JSON.parse(localStorage.getItem(STORAGE_STATS_KEY) || '{}');
    const profiles: ExtendedProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    // Mettre à jour les stats avec les données actuelles
    const publicCount = profiles.filter(p => p.is_public && !p.is_archived).length;
    const archivedCount = profiles.filter(p => p.is_archived).length;
    const urgentCount = profiles.filter(p => (p.metadata?.urgency_score || 0) >= 8).length;
    const verifiedCount = profiles.filter(p => p.is_verified).length;
    
    const totalViews = profiles.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalQRDownloads = profiles.reduce((sum, p) => sum + (p.metadata?.qr_downloads || 0), 0);
    
    return {
      total: {
        profiles: profiles.length,
        views: totalViews,
        qr_downloads: totalQRDownloads,
        public_profiles: publicCount,
        archived_profiles: archivedCount,
        urgent_profiles: urgentCount,
        verified_profiles: verifiedCount
      },
      daily: stats.daily || {},
      trends: stats.trends || { views_change: 0, new_profiles_change: 0 }
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return {
      total: { profiles: 0, views: 0, qr_downloads: 0, public_profiles: 0, archived_profiles: 0, urgent_profiles: 0, verified_profiles: 0 },
      daily: {},
      trends: { views_change: 0, new_profiles_change: 0 }
    };
  }
};

export const getAuditLogs = async (limit?: number): Promise<AuditLogEntry[]> => {
  try {
    const logs: AuditLogEntry[] = JSON.parse(localStorage.getItem(STORAGE_AUDIT_LOG_KEY) || '[]');
    return limit ? logs.slice(0, limit) : logs as AuditLogEntry[];
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return [];
  }
};

export const restoreBackup = async (backupId: string): Promise<boolean> => {
  try {
    const backups: BackupData[] = JSON.parse(localStorage.getItem(STORAGE_BACKUPS_KEY) || '[]');
    const backup = backups.find(b => b.id === backupId);
    
    if (!backup) return false;
    
    // Créer un backup avant restauration
    createBackup('manual');
    
    // Restaurer
    localStorage.setItem(STORAGE_KEY, JSON.stringify(backup.data));
    
    // FIX: Add 'restore' and 'import' to AuditLog and updateStats actions
    logAudit('restore', 'system', 'Backup Restoration', { backupId });
    return true;
  } catch (error) {
    console.error('Error restoring backup:', error);
    return false;
  }
};

export const getBackups = async (): Promise<BackupData[]> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_BACKUPS_KEY) || '[]');
  } catch (error) {
    console.error('Error getting backups:', error);
    return [];
  }
};

export const exportProfiles = async (format: 'json' | 'csv' = 'json'): Promise<string> => {
  const profiles = await getProfiles();
  
  if (format === 'csv') {
    const headers = ['Nom', 'Lieu habituel', 'Récit reformulé', 'Besoins', 'Public', 'Vérifié', 'Date création'];
    const rows = profiles.map(p => [
      `"${p.name}"`,
      `"${p.usual_place}"`,
      `"${p.reformulated_story.replace(/"/g, '""')}"`,
      `"${p.needs.replace(/\n/g, '; ').replace(/"/g, '""')}"`,
      p.is_public ? 'Oui' : 'Non',
      p.is_verified ? 'Oui' : 'Non',
      new Date(p.created_at).toLocaleDateString('fr-FR')
    ]);
    
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
  
  return JSON.stringify(profiles, null, 2);
};

export const importProfiles = async (data: string, format: 'json' | 'csv' = 'json'): Promise<number> => {
  try {
    let importedProfiles: any[] = [];
    
    if (format === 'json') {
      importedProfiles = JSON.parse(data);
    } else {
      // CSV parsing simple
      const lines = data.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const profile: any = {};
        
        headers.forEach((header, index) => {
          profile[header] = values[index];
        });
        
        importedProfiles.push(profile);
      }
    }
    
    // Convertir au format ExtendedProfile
    const currentProfiles: ExtendedProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newProfiles: ExtendedProfile[] = [];
    
    importedProfiles.forEach((p, index) => {
      const existing = currentProfiles.find(cp => cp.publicId === p.publicId);
      
      if (!existing) {
        newProfiles.push({
          id: `imported_${Date.now()}_${index}`,
          publicId: p.publicId || `imported-${Date.now()}-${index}`,
          name: p.name || 'Importé',
          nom: p.name || 'Importé',
          raw_story: p.raw_story || '',
          reformulated_story: p.reformulated_story || '',
          recit_reformule: p.reformulated_story || '',
          needs: p.needs || '',
          besoins_immediats: p.metadata?.immediate_needs || [],
          immediate_needs: p.metadata?.immediate_needs || [],
          usual_place: p.usual_place || '',
          lieu_habituel: p.usual_place || '',
          is_public: p.is_public !== undefined ? p.is_public : false,
          is_archived: p.is_archived || false,
          is_verified: p.is_verified || false,
          created_at: p.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          views: 0,
          version: 1,
          metadata: {
            qr_downloads: 0,
            link_shares: 0,
            last_updated_by: 'import',
            tags: [],
            urgency_score: 5,
            verification_status: 'pending',
            immediate_needs: []
          }
        } as ExtendedProfile);
      }
    });
    
    // Ajouter les nouveaux profils
    currentProfiles.push(...newProfiles);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentProfiles));
    
    createBackup('manual');
    // FIX: Add 'restore' and 'import' to AuditLog and updateStats actions
    logAudit('import', 'system', 'Import', { count: newProfiles.length });
    
    return newProfiles.length;
  } catch (error) {
    console.error('Error importing profiles:', error);
    throw error;
  }
};

// Initialiser le storage au chargement
initializeStorage();
