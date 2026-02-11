
import { Profile, LieuGroupe } from '../types';

const STORAGE_KEY = 'jexiste_profiles_v5_long_factuel';

const initialProfiles: Profile[] = [
  {
    id: '1',
    publicId: 'jean-place-bourse',
    name: 'Jean',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    raw_story: "J'étais menuisier pendant 20 ans. Puis l'atelier a fait faillite en 2019. J'ai pas réussi à retrouver, à mon âge c'est dur. Mon loyer a grimpé, et un matin, les huissiers étaient là. Je me suis retrouvé avec mes outils sur le trottoir. La Bourse, c'est devenu ma maison car j'y connais tout le monde.",
    reformulated_story: "Sujet ayant exercé la profession de menuisier-ébéniste pendant une période continue de 20 ans. Rupture professionnelle survenue en 2019 à la suite de la liquidation judiciaire de l'atelier employeur. Les tentatives de réinsertion ont échoué en raison de l'âge du sujet et de la spécialisation du secteur. Une accumulation d'impayés locatifs sur douze mois a conduit à une procédure d'expulsion physique exécutée par voie d'huissier. Le sujet a perdu l'accès à ses outils de travail lors de l'éviction. Présence quotidienne constatée dans le secteur de la Place de la Bourse depuis 48 mois. Le sujet a développé un réseau de solidarité informelle avec les commerçants locaux. Absence de perspectives de retour à l'emploi ou au logement stable sans intervention administrative lourde. État de santé physique déclinant lié à l'exposition prolongée aux intempéries.",
    needs: "- Sac de couchage technique\n- Tickets STIB\n- Radio à piles",
    urgent_needs: ["Sac de couchage technique"],
    usual_place: "Place de la Bourse, Bruxelles",
    is_public: true,
    is_archived: false,
    is_verified: true,
    created_at: new Date('2023-11-15').toISOString(),
    views: 1250,
    needs_clicks: 45,
    shares_count: 12
  },
  {
    id: '2',
    publicId: 'marie-canal-brussels',
    name: 'Marie',
    image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
    raw_story: "J'avais une petite vie tranquille jusqu'à ma séparation. Mon ex a tout gardé, l'appart était à son nom. Je suis partie avec mon chien et mon sac à dos. On dort vers le canal. C'est le froid le plus dur, et le regard des gens qui pensent que je suis une droguée alors que je suis juste épuisée.",
    reformulated_story: "Profil de rupture familiale et résidentielle. Antécédents de vie stable interrompus par une séparation conjugale conflictuelle. Le logement étant contractuellement au nom du conjoint, le sujet s'est retrouvé sans titre d'occupation légal ni recours immédiat. Départ du domicile avec ressources financières nulles, accompagnée d'un animal de compagnie (canidé). Occupation précaire du secteur Quai des Péniches. Le sujet rapporte une fatigue chronique sévère due à l'insécurité nocturne et à la chute des températures saisonnières. On note une stigmatisation sociale importante rapportée par le sujet (confusion du public entre état d'épuisement et toxicomanie). Aucune dépendance aux substances n'est constatée lors de l'entretien. Priorité au relogement d'urgence acceptant les animaux domestiques.",
    needs: "- Croquettes pour chien\n- Tente 2 places\n- Kit hygiène",
    urgent_needs: ["Tente 2 places", "Kit hygiène"],
    usual_place: "Quai des Péniches, Bruxelles",
    is_public: true,
    is_archived: false,
    is_verified: true,
    created_at: new Date('2023-12-10').toISOString(),
    views: 890,
    needs_clicks: 32,
    shares_count: 5
  },
  {
    id: '3',
    publicId: 'ahmed-gare-midi',
    name: 'Ahmed',
    image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    raw_story: "J'étais prof d'histoire. La guerre a tout cassé. Je suis arrivé ici en pensant que mes diplômes serviraient, mais je suis un numéro. Je dors à la Gare du Midi. Je lis pour ne pas oublier qui je suis. Mon basculement ? Une bombe sur mon école, puis l'exil.",
    reformulated_story: "Ancien enseignant de niveau secondaire (Histoire). Parcours d'exil forcé suite à un conflit armé ayant entraîné la destruction des infrastructures scolaires et professionnelles du pays d'origine. Arrivée sur le territoire belge avec des qualifications académiques non reconnues par les instances d'équivalence. Le sujet se trouve actuellement dans une impasse administrative, sans statut professionnel défini. Occupation habituelle du hall et des abords de la Gare du Midi. Conditions de vie marquées par une exposition constante aux courants d'air et une pollution sonore élevée. Stratégies de maintien des facultés cognitives observées par la pratique assidue de la lecture. Le sujet exprime un sentiment de déshumanisation lié au traitement bureaucratique de son dossier. Besoins prioritaires identifiés en vêtements thermiques et accès à des ressources culturelles.",
    needs: "- Livres (Histoire)\n- Chaussettes laine\n- Lampe torche",
    urgent_needs: ["Chaussettes laine"],
    usual_place: "Gare du Midi, Saint-Gilles",
    is_public: true,
    is_archived: false,
    is_verified: true,
    created_at: new Date('2024-01-05').toISOString(),
    views: 2100,
    needs_clicks: 110,
    shares_count: 28
  }
];

export const getProfiles = async (): Promise<Profile[]> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : initialProfiles;
};

export const getPublicProfiles = async (): Promise<Profile[]> => {
  const p = await getProfiles();
  // Un profil doit être public ET non archivé pour apparaître dans l'index public
  return p.filter(x => x.is_public && !x.is_archived);
};

export const getProfileByPublicId = async (publicId: string): Promise<Profile | null> => {
  const p = await getProfiles();
  return p.find(x => x.publicId === publicId) || null;
};

export const saveProfile = async (profileData: Profile): Promise<Profile> => {
  const p = await getProfiles();
  const idx = p.findIndex(x => x.id === profileData.id);
  if (idx !== -1) p[idx] = profileData;
  else p.push(profileData);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  return profileData;
};

export const deleteProfile = async (id: string): Promise<void> => {
  const p = await getProfiles();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p.filter(x => x.id !== id)));
};

export const toggleArchiveProfile = async (id: string): Promise<void> => {
  const p = await getProfiles();
  const idx = p.findIndex(x => x.id === id);
  if (idx !== -1) {
    p[idx].is_archived = !p[idx].is_archived;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }
};

export const toggleProfileVisibility = async (id: string, isPublic: boolean): Promise<void> => {
  const p = await getProfiles();
  const idx = p.findIndex(x => x.id === id);
  if (idx !== -1) {
    p[idx].is_public = isPublic;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }
};

export const incrementStat = async (publicId: string, stat: 'views' | 'needs_clicks' | 'shares_count'): Promise<void> => {
  const p = await getProfiles();
  const idx = p.findIndex(x => x.publicId === publicId);
  if (idx !== -1) {
    const currentVal = p[idx][stat] || 0;
    p[idx] = { ...p[idx], [stat]: currentVal + 1 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }
};
