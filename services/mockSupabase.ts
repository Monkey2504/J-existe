
import { Profil } from '../types.ts';

const DB_NAME = 'JexisteDB';
const STORE_NAME = 'profiles';
const DB_VERSION = 1;
const MIGRATION_KEY = 'jexiste_idb_migrated';
const SEED_KEY = 'jexiste_seeded_v1';

const SEED_PROFILES: Profil[] = [
  {
    id: 'p_1',
    publicId: 'jean-pierre-bxl-82',
    name: 'Jean-Pierre',
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
  },
  {
    id: 'p_4',
    publicId: 'elena-namur-99',
    name: 'Elena',
    raw_story: 'Vendeuse en boulangerie. Contrat intérim non renouvelé. Pas assez d\'heures pour le chômage. À la rue depuis 3 mois vers Porte de Namur. Besoin de papiers administratifs, elle est perdue dans les démarches CPAS.',
    reformulated_story: 'ÉLÉMENTS DE PARCOURS : Vendeuse en secteur alimentaire (boulangerie). Statut précaire (intérim). POINT DE RUPTURE : Fin de contrat et absence d\'ouverture de droits aux allocations de chômage. SITUATION MATÉRIELLE ACTUELLE : Zone Porte de Namur. Nécessité d\'un accompagnement administratif pour régularisation CPAS.',
    needs: '- Aide aux démarches administratives\n- Titres de transport (STIB)',
    urgent_needs: ['Aide aux démarches administratives'],
    usual_place: 'Porte de Namur',
    is_public: true,
    is_archived: false,
    is_verified: true,
    created_at: '2024-03-05T16:45:00Z',
    views: 67,
    needs_clicks: 20
  },
  {
    id: 'p_5',
    publicId: 'antoine-stgilles-22',
    name: 'Antoine',
    raw_story: 'Jeune de 21 ans. Sortie d\'institution à 18 ans. Pas de famille. A enchaîné les petits boulots puis plus rien. Parvis de Saint-Gilles. A besoin de matériel pour dormir dehors, son sac a été volé.',
    reformulated_story: 'ÉLÉMENTS DE PARCOURS : Sortie de dispositif d\'Aide à la Jeunesse. Emplois précaires successifs. POINT DE RUPTURE : Absence de réseau de soutien familial au passage à l\'âge adulte. SITUATION MATÉRIELLE ACTUELLE : Parvis de Saint-Gilles. Sujet victime de vol de matériel de campement.',
    needs: '- Sac à dos (60L)\n- Baskets (taille 42)',
    urgent_needs: ['Sac à dos (60L)'],
    usual_place: 'Parvis de Saint-Gilles',
    is_public: true,
    is_archived: false,
    is_verified: true,
    created_at: '2024-03-10T11:00:00Z',
    views: 210,
    needs_clicks: 45
  },
  {
    id: 'p_6',
    publicId: 'sophie-ste-catherine-55',
    name: 'Sophie',
    raw_story: '74 ans. Ancienne couturière. Retraite de 800 euros. Loyer est passé à 750. Expulsée après 20 ans dans le même appart. Place Sainte-Catherine. Très digne. Ne demande rien mais n\'a pas mangé depuis hier.',
    reformulated_story: 'ÉLÉMENTS DE PARCOURS : Couturière (retraitée). POINT DE RUPTURE : Déséquilibre financier majeur entre le montant de la pension légale et l\'inflation du marché locatif privé. SITUATION MATÉRIELLE ACTUELLE : Place Sainte-Catherine. Risque de dénutrition identifié.',
    needs: '- Repas chauds quotidiens\n- Lunettes de vue (correction à vérifier)',
    urgent_needs: ['Repas chauds quotidiens'],
    usual_place: 'Place Sainte-Catherine',
    is_public: true,
    is_archived: false,
    is_verified: true,
    created_at: '2024-03-12T08:30:00Z',
    views: 340,
    needs_clicks: 80
  },
  {
    id: 'p_7',
    publicId: 'brahim-josse-33',
    name: 'Brahim',
    raw_story: 'Commis de cuisine. Restaurant a fermé pendant le COVID, n\'a jamais retrouvé. Plus de droits sociaux. Saint-Josse / Botanique. Cherche des petits boulots en cuisine mais sans adresse c\'est dur. Besoin de couteaux pour faire des extras.',
    reformulated_story: 'ÉLÉMENTS DE PARCOURS : Personnel de restauration (commis). POINT DE RUPTURE : Fermeture d\'établissement durant la crise sanitaire et épuisement des droits sociaux. SITUATION MATÉRIELLE ACTUELLE : Zone Botanique. Sujet en recherche active de missions ponctuelles en restauration.',
    needs: '- Mallette de couteaux professionnelle\n- Manteau chaud (L)',
    urgent_needs: [],
    usual_place: 'Botanique (Saint-Josse)',
    is_public: true,
    is_archived: false,
    is_verified: false,
    created_at: '2024-03-14T19:00:00Z',
    views: 56,
    needs_clicks: 3
  },
  {
    id: 'p_8',
    publicId: 'luc-montgomery-11',
    name: 'Luc',
    raw_story: 'Ancien chauffeur de camion. Diabétique, a perdu son permis suite à des problèmes de vue. Plus de boulot, plus de camion, plus de logement. Montgomery. A besoin de chaussettes propres pour ses pieds (santé).',
    reformulated_story: 'ÉLÉMENTS DE PARCOURS : Chauffeur poids-lourd. POINT DE RUPTURE : Inaptitude médicale au poste (troubles de la vision) entraînant la perte de l\'emploi et du domicile. SITUATION MATÉRIELLE ACTUELLE : Zone Montgomery. Nécessité de soins de prévention podologique pour sujet diabétique.',
    needs: '- Chaussettes en coton blanc\n- Bouteilles d\'eau (5L)',
    urgent_needs: ['Chaussettes en coton blanc'],
    usual_place: 'Montgomery',
    is_public: true,
    is_archived: false,
    is_verified: true,
    created_at: '2024-03-15T12:00:00Z',
    views: 42,
    needs_clicks: 8
  },
  {
    id: 'p_9',
    publicId: 'marie-flagey-44',
    name: 'Marie',
    raw_story: 'Étudiante en art, 23 ans. Rupture familiale violente. N\'a plus de bourse. Vit en squat ou dans sa voiture à Flagey. Cherche des tickets STIB pour aller aux cours.',
    reformulated_story: 'ÉLÉMENTS DE PARCOURS : Étudiante en enseignement supérieur artistique. POINT DE RUPTURE : Rupture brutale du soutien familial et suspension des aides financières liées au cursus. SITUATION MATÉRIELLE ACTUELLE : Zone Place Flagey. Sujet en situation de mal-logement (véhicule).',
    needs: '- Abonnements / Tickets STIB\n- Accès douche',
    urgent_needs: ['Abonnements / Tickets STIB'],
    usual_place: 'Place Flagey',
    is_public: true,
    is_archived: false,
    is_verified: false,
    created_at: '2024-03-16T15:30:00Z',
    views: 189,
    needs_clicks: 34
  },
  {
    id: 'p_10',
    publicId: 'victor-sablon-77',
    name: 'Victor',
    raw_story: 'Ancien prof de dessin. Suite à un deuil, a tout arrêté. Vit dans la rue depuis 5 ans. On le voit souvent au Sablon en train de dessiner sur des cartons. Besoin de matériel de dessin pour garder le moral.',
    reformulated_story: 'ÉLÉMENTS DE PARCOURS : Enseignant en arts plastiques. POINT DE RUPTURE : Cessation d\'activité volontaire suite à un événement de vie majeur. Itinérance de longue durée (5 ans). SITUATION MATÉRIELLE ACTUELLE : Zone Sablon. Activité artistique résiduelle sur supports de récupération.',
    needs: '- Papier dessin et fusains\n- Couverture laine',
    urgent_needs: [],
    usual_place: 'Le Sablon',
    is_public: true,
    is_archived: false,
    is_verified: true,
    created_at: '2024-03-18T10:10:00Z',
    views: 310,
    needs_clicks: 15
  }
];

/**
 * Initialise la connexion à IndexedDB
 */
const ouvrirDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject("Erreur d'ouverture IndexedDB");
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Peuple la base avec les 10 profils si elle est vide
 */
const peuplerDonneesSeed = async (db: IDBDatabase) => {
  const estSeede = localStorage.getItem(SEED_KEY);
  if (estSeede) return;

  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise<void>((resolve) => {
    const countRequest = store.count();
    countRequest.onsuccess = () => {
      if (countRequest.result === 0) {
        SEED_PROFILES.forEach(p => store.put(p));
        localStorage.setItem(SEED_KEY, 'true');
        console.log("Seeding des 10 profils initiaux terminé.");
      }
      resolve();
    };
  });
};

/**
 * Migre les données du localStorage vers IndexedDB si nécessaire
 */
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
        if (!profil.id) profil.id = `p_${Math.random().toString(36).substr(2, 9)}`;
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
    await peuplerDonneesSeed(db); // Correction : On peuple si vide
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject("Erreur de lecture");
    });
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const obtenirProfilsPublics = async (): Promise<Profil[]> => {
  const p = await obtenirProfils();
  return p.filter(x => x.is_public && !x.is_archived);
};

export const obtenirProfilParIdPublic = async (publicId: string): Promise<Profil | null> => {
  const p = await obtenirProfils();
  return p.find(x => x.publicId === publicId) || null;
};

export const sauvegarderProfil = async (donneesProfil: Profil): Promise<Profil> => {
  const db = await ouvrirDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const profilMisAJour = { ...donneesProfil, updated_at: new Date().toISOString() };
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
    const p = (request.result as Profil[]).find(x => x.publicId === publicId);
    if (p) {
      p[stat] = (p[stat] || 0) + 1;
      store.put(p);
    }
  };
};
