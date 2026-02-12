
import { Profil } from '../types.ts';

const DB_NAME = 'JexisteDB';
const STORE_NAME = 'profiles';
const DB_VERSION = 1;
const MIGRATION_KEY = 'jexiste_idb_migrated';
const SEED_KEY = 'jexiste_seeded_v2'; // Changé pour forcer le re-seed

// Fallback robuste pour la génération d'ID unique
const generateUniqueId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `p_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
};

const SEED_PROFILES: Profil[] = [
  {
    id: 'p_1',
    publicId: 'jean-pierre-bxl-82',
    name: 'Jean-Pierre',
    donation_url: 'https://donate.stripe.com/demo_jp',
    raw_story: 'Ancien maçon pendant 30 ans. Accident de chantier en 2018, dos cassé. N\'a pas pu reprendre. Pension d\'invalidité trop faible pour le loyer à Anderlecht. Expulsé en 2021. Dort souvent près de la Bourse. Se plaint du froid aux pieds.',
    reformulated_story: 'ÉLÉMENTS DE PARCOURS : Ouvrier dans le secteur de la construction (maçonnerie) durant trois décennies. Arrêt d\'activité en 2018 suite à un accident de travail. POINT DE RUPTURE : Invalidité physique entraînant une baisse de revenus et une expulsion locative en 2021. SITUATION MATÉRIELLE ACTUELLE : Zone Bourse. Besoins identifiés en équipement thermique podologique.',
    needs: '- Chaussures de marche (taille 44)\n- Sac de couchage grand froid',
    urgent_needs: ['Chaussures de marche (taille 44)'],
    usual_place: 'Place de la Bourse',
    is_public: true,
    is_archived: false,
    is_verified: true,
    created_at: '2024-01-10T10:00:00Z',
    views: 124,
    needs_clicks: 12
  },
  {
    id: 'p_2',
    publicId: 'fatima-midi-45',
    name: 'Fatima',
    donation_url: 'https://donate.stripe.com/demo_fatima',
    raw_story: 'Aide-ménagère, travaillait en titres-services. Divorce difficile, s\'est retrouvée à la rue avec ses valises. Ne veut pas aller en centre d\'accueil, a peur pour ses affaires. Zone Gare du Midi. Demande souvent des produits d\'hygiène.',
    reformulated_story: 'ÉLÉMENTS DE PARCOURS : Employée dans le secteur du nettoyage (titres-services). POINT DE RUPTURE : Rupture conjugale immédiate sans solution de relogement. SITUATION MATÉRIELLE ACTUELLE : Zone Gare du Midi. Sujet en situation d\'itinérance avec effets personnels volumineux. Besoin de kits d\'hygiène de base.',
    needs: '- Kit hygiène féminine\n- Carte de téléphone (recharge)',
    urgent_needs: ['Kit hygiène féminine'],
    usual_place: 'Gare du Midi',
    is_public: true,
    is_archived: false,
    is_verified: true,
    created_at: '2024-02-15T14:20:00Z',
    views: 89,
    needs_clicks: 5
  },
  {
    id: 'p_3',
    publicId: 'marc-schuman-12',
    name: 'Marc',
    raw_story: 'Ancien technicien informatique. Burn-out sévère il y a 2 ans. A perdu pied, plus de loyer payé. Squat un moment puis rue. Quartier européen. Propre sur lui mais très fatigué. Cherche à charger son vieux laptop pour refaire son CV.',
    reformulated_story: 'ÉLÉMENTS DE PARCOURS : Technicien de maintenance informatique. POINT DE RUPTURE : Arrêt de travail prolongé suivi d\'une cessation de paiement des charges locatives. SITUATION MATÉRIELLE ACTUELLE : Quartier européen / Schuman. Sujet maintenu dans une démarche de recherche d\'emploi malgré l\'absence de domicile.',
    needs: '- Accès prise électrique / espace coworking\n- Vêtements de rechange propres',
    urgent_needs: [],
    usual_place: 'Quartier Schuman',
    is_public: true,
    is_archived: false,
    is_verified: false,
    created_at: '2024-03-01T09:15:00Z',
    views: 45,
    needs_clicks: 2
  }
];

const ouvrirDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject("Erreur d'ouverture IndexedDB");
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    } catch (e) {
      reject("IndexedDB non supporté");
    }
  });
};

const peuplerDonneesSeed = async (db: IDBDatabase) => {
  const estSeede = localStorage.getItem(SEED_KEY);
  if (estSeede) return;

  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise<void>((resolve) => {
    const countRequest = store.count();
    countRequest.onsuccess = () => {
      // On vide et on remet si on veut forcer la mise à jour (V2)
      if (countRequest.result > 0) {
        store.clear();
      }
      SEED_PROFILES.forEach(p => store.put(p));
      localStorage.setItem(SEED_KEY, 'true');
      resolve();
    };
    countRequest.onerror = () => resolve();
  });
};

const migrerDepuisLocalStorage = async (db: IDBDatabase) => {
  const estMigre = localStorage.getItem(MIGRATION_KEY);
  if (estMigre) return;

  const anciennesDonnees = localStorage.getItem('profiles') || localStorage.getItem('jexiste_profiles');
  
  if (anciennesDonnees) {
    try {
      const profils = JSON.parse(anciennesDonnees) as Profil[];
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      for (const profil of profils) {
        if (!profil.id) profil.id = generateUniqueId();
        store.put(profil);
      }
    } catch (e) {
      console.error("Échec migration :", e);
    }
  }
  localStorage.setItem(MIGRATION_KEY, 'true');
};

export const obtenirProfils = async (): Promise<Profil[]> => {
  try {
    const db = await ouvrirDB();
    await migrerDepuisLocalStorage(db);
    await peuplerDonneesSeed(db);
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject("Erreur de lecture");
    });
  } catch (e) {
    console.error("Erreur obtenirProfils:", e);
    return [];
  }
};

export const obtenirProfilsPublics = async (): Promise<Profil[]> => {
  const p = await obtenirProfils();
  return p.filter(x => x && x.is_public && !x.is_archived);
};

export const obtenirProfilParIdPublic = async (publicId: string): Promise<Profil | null> => {
  const p = await obtenirProfils();
  return p.find(x => x && x.publicId === publicId) || null;
};

export const sauvegarderProfil = async (donneesProfil: Profil): Promise<Profil> => {
  const db = await ouvrirDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const profilMisAJour = { 
      ...donneesProfil, 
      id: donneesProfil.id || generateUniqueId(),
      updated_at: new Date().toISOString() 
    };
    const request = store.put(profilMisAJour);
    request.onsuccess = () => resolve(profilMisAJour);
    request.onerror = () => reject("Erreur d'écriture IndexedDB");
  });
};

export const supprimerProfil = async (id: string): Promise<void> => {
  const db = await ouvrirDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Erreur de suppression");
  });
};

export const basculerArchiveProfil = async (id: string): Promise<void> => {
  const db = await ouvrirDB();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  const getRequest = store.get(id);
  getRequest.onsuccess = () => {
    const p = getRequest.result as Profil;
    if (p) {
      p.is_archived = !p.is_archived;
      store.put(p);
    }
  };
};

export const incrementerStatistique = async (publicId: string, stat: 'views' | 'needs_clicks' | 'shares_count'): Promise<void> => {
  const db = await ouvrirDB();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  const request = store.getAll();
  request.onsuccess = () => {
    const p = (request.result as Profil[]).find(x => x && x.publicId === publicId);
    if (p) {
      p[stat] = (p[stat] || 0) + 1;
      store.put(p);
    }
  };
};
