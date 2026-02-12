
import { Profil } from '../types.ts';

const DB_NAME = 'JexisteDB';
const STORE_NAME = 'profiles';
const DB_VERSION = 1;
const MIGRATION_KEY = 'jexiste_idb_migrated';
const SEED_KEY = 'jexiste_seeded_v3'; // Incrémenté pour forcer le re-seed avec 10 profils

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
    reformulated_story: 'PARCOURS : Ouvrier qualifié du bâtiment (30 ans d\'ancienneté). RUPTURE : Accident du travail en 2018 entraînant une invalidité permanente. PERTE DE LOGEMENT : 2021. BESOINS : Équipement thermique spécialisé (podologie) et matériel de couchage haute résistance.',
    needs: '- Chaussures de marche (44)\n- Sac de couchage grand froid',
    urgent_needs: ['Chaussures de marche (44)'],
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
    raw_story: 'Aide-ménagère en titres-services. Divorce difficile en 2022. S\'est retrouvée sans solution de relogement. Zone Gare du Midi. Garde ses valises avec elle en permanence par peur du vol. Demande des produits d\'hygiène.',
    reformulated_story: 'PARCOURS : Employée de ménage. RUPTURE : Dissolution de cellule familiale sans préavis. SITUATION : Itinérance avec bagages volumineux en zone de transit. BESOINS : Nécessaire d\'hygiène personnelle et crédit de communication.',
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
    raw_story: 'Ancien technicien informatique. Burn-out sévère en 2021. N\'a plus géré ses courriers ni son loyer. Expulsé. Quartier européen. Propre sur lui mais très fatigué. Cherche à charger son laptop pour ses démarches.',
    reformulated_story: 'PARCOURS : Technicien de maintenance IT. RUPTURE : Arrêt de travail pour raisons de santé mentale suivi d\'une rupture de droits. SITUATION : Zone Schuman. Démarche active de réinsertion numérique. BESOINS : Accès à l\'énergie et vêtements de présentation.',
    needs: '- Accès prise électrique\n- Vêtements de rechange propres',
    urgent_needs: [],
    usual_place: 'Quartier Schuman',
    is_public: true,
    is_archived: false,
    is_verified: false,
    created_at: '2024-03-01T09:15:00Z',
    views: 45,
    needs_clicks: 2
  },
  {
    id: 'p_4',
    publicId: 'amine-ste-catherine',
    name: 'Amine',
    raw_story: 'Étudiant étranger, a perdu sa bourse après un échec aux examens. Sa famille au pays ne peut plus l\'aider. Travaille au noir pour manger mais ne peut plus payer son kot. Dort dans les parkings près de Ste-Catherine.',
    reformulated_story: 'PARCOURS : Cursus universitaire interrompu. RUPTURE : Arrêt de financement institutionnel. SITUATION : Précarité étudiante extrême en zone centrale. BESOINS : Aide alimentaire immédiate et soutien juridique pour régularisation.',
    needs: '- Chèques repas\n- Sac à dos solide',
    urgent_needs: ['Chèques repas'],
    usual_place: 'Sainte-Catherine',
    is_public: true,
    is_archived: false,
    is_verified: true,
    created_at: '2024-03-10T11:00:00Z',
    views: 67,
    needs_clicks: 8
  },
  {
    id: 'p_5',
    publicId: 'sophie-flagey',
    name: 'Sophie',
    raw_story: 'Dame âgée (72 ans). Pension trop faible pour Bruxelles. A perdu son appartement suite à une vente de l\'immeuble. Trop d\'attente pour un logement social. Quartier Ixelles/Flagey. Se réfugie dans les bus la nuit.',
    reformulated_story: 'PARCOURS : Retraitée. RUPTURE : Fin de bail commercial d\'habitation non renouvelé. SITUATION : Sénior en situation de mal-logement itinérant nocturne (réseau de transport). BESOINS : Solutions de répit diurne et aide aux démarches CPAS.',
    needs: '- Thermos de qualité\n- Écharpe et gants en laine',
    urgent_needs: ['Thermos de qualité'],
    usual_place: 'Place Flagey',
    is_public: true,
    is_archived: false,
    is_verified: true,
    created_at: '2024-03-12T16:30:00Z',
    views: 156,
    needs_clicks: 25
  },
  {
    id: 'p_6',
    publicId: 'igor-st-gilles',
    name: 'Igor',
    raw_story: 'Venu d\'Europe de l\'Est pour un chantier, l\'employeur a disparu sans payer les salaires. Sans contrat, sans papiers, à la rue. Saint-Gilles. Très bon bricoleur mais n\'a plus ses outils.',
    reformulated_story: 'PARCOURS : Ouvrier polyvalent. RUPTURE : Exploitation frauduleuse dans le secteur informel de la construction. SITUATION : Zone Sud/Saint-Gilles. Isolement linguistique partiel. BESOINS : Outillage de base pour petits travaux et interprétariat.',
    needs: '- Jeu de tournevis / outils\n- Dictionnaire FR/RU',
    urgent_needs: [],
    usual_place: 'Parvis de Saint-Gilles',
    is_public: true,
    is_archived: false,
    is_verified: true,
    created_at: '2024-03-15T10:00:00Z',
    views: 32,
    needs_clicks: 1
  },
  {
    id: 'p_7',
    publicId: 'clara-matonge',
    name: 'Clara',
    raw_story: 'Jeune fille en rupture familiale. Problèmes d\'addiction passés, essaie de s\'en sortir. Matongé. Dort souvent près de la galerie de la porte de Namur. A besoin d\'un nouveau téléphone pour rester en contact avec son éducatrice.',
    reformulated_story: 'PARCOURS : Jeune adulte en parcours de soin. RUPTURE : Conflit intrafamilial majeur. SITUATION : Itinérance en zone Ixelles/Matongé. Suivi social en cours. BESOINS : Outil de communication numérique et produits de première nécessité.',
    needs: '- Téléphone portable basique\n- Powerbank',
    urgent_needs: ['Téléphone portable basique'],
    usual_place: 'Matongé / Porte de Namur',
    is_public: true,
    is_archived: false,
    is_verified: true,
    created_at: '2024-03-18T19:20:00Z',
    views: 210,
    needs_clicks: 45
  },
  {
    id: 'p_8',
    publicId: 'benoit-rogier',
    name: 'Benoît',
    raw_story: 'Ancien propriétaire d\'une petite épicerie. Faillite après le COVID. A tout perdu. Rogier. Très digne, cache sa situation à ses anciens clients qu\'il croise parfois. A besoin d\'une lampe de poche pour lire le soir.',
    reformulated_story: 'PARCOURS : Indépendant (commerce de détail). RUPTURE : Cessation d\'activité pour insolvabilité post-crise sanitaire. SITUATION : Zone Rogier/Botanique. Maintien d\'une façade sociale. BESOINS : Matériel d\'éclairage et livres.',
    needs: '- Lampe frontale\n- Piles rechargeables',
    urgent_needs: [],
    usual_place: 'Place Rogier',
    is_public: true,
    is_archived: false,
    is_verified: false,
    created_at: '2024-03-20T08:45:00Z',
    views: 54,
    needs_clicks: 4
  },
  {
    id: 'p_9',
    publicId: 'elena-central',
    name: 'Elena',
    raw_story: 'Aide-soignante, logeait chez la personne âgée dont elle s\'occupait. Le décès de cette dernière l\'a jetée à la rue en 24h sans contrat de bail. Gare Centrale. Cherche une chambre chez l\'habitant en échange de services.',
    reformulated_story: 'PARCOURS : Professionnelle du soin à domicile. RUPTURE : Perte simultanée de l\'emploi et de la résidence pour cause de décès de l\'employeur. SITUATION : Transit Gare Centrale. BESOINS : Mise en relation pour hébergement solidaire.',
    needs: '- Aide à la recherche de logement\n- Valise à roulettes solide',
    urgent_needs: ['Aide à la recherche de logement'],
    usual_place: 'Gare Centrale',
    is_public: true,
    is_archived: false,
    is_verified: true,
    created_at: '2024-03-22T12:00:00Z',
    views: 112,
    needs_clicks: 18
  },
  {
    id: 'p_10',
    publicId: 'yassin-pl-monnaie',
    name: 'Yassin',
    raw_story: 'Cuisinier. Brûlure grave à la main lors d\'un service, pas d\'assurance car non-déclaré par le patron. Ne peut plus cuisiner pour l\'instant. Place de la Monnaie. A besoin de pansements spécifiques.',
    reformulated_story: 'PARCOURS : Professionnel de la restauration. RUPTURE : Accident du travail non couvert par la sécurité sociale. SITUATION : Zone Monnaie. Incapacité de travail temporaire non indemnisée. BESOINS : Matériel de soin stérile et pommades apaisantes.',
    needs: '- Kit de pansements stériles\n- Soutien financier pour soins',
    urgent_needs: ['Kit de pansements stériles'],
    usual_place: 'Place de la Monnaie',
    is_public: true,
    is_archived: false,
    is_verified: true,
    created_at: '2024-03-25T15:10:00Z',
    views: 88,
    needs_clicks: 30
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
      // On vide tout et on remplace par les 10 nouveaux profils pour assurer la cohérence
      store.clear().onsuccess = () => {
        SEED_PROFILES.forEach(p => store.put(p));
        localStorage.setItem(SEED_KEY, 'true');
        resolve();
      };
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
