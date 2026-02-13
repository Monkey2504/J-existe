
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Profil, Commentaire } from '../types.ts';

const SUPABASE_URL = "https://dhdvmiimtauebnflmgxa.supabase.co";
const SUPABASE_KEY = "sb_publishable_kBpi1JNqSfBeu7cvxLxpVg_rCQxJdbb";

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;
  try {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY);
    return supabaseInstance;
  } catch (e) {
    console.error("Erreur critique d'initialisation Supabase:", e);
    return null;
  }
};

export const testerConnexion = async (): Promise<{ ok: boolean; message: string; url: string }> => {
  const client = getSupabase();
  if (!client) return { ok: false, message: "Client non initialisé.", url: SUPABASE_URL };
  try {
    const { error } = await client.from('profiles').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return { ok: false, message: "Table 'profiles' manquante. Veuillez exécuter les scripts SQL.", url: SUPABASE_URL };
      }
      throw error;
    }
    return { ok: true, message: "Synchronisé avec le cloud.", url: SUPABASE_URL };
  } catch (e: any) {
    return { ok: false, message: e.message || "Erreur réseau Supabase.", url: SUPABASE_URL };
  }
};

export const peuplerSupabase = async (profils: Partial<Profil>[]): Promise<void> => {
  const client = getSupabase();
  if (!client) throw new Error("Supabase non disponible.");
  
  // Nettoyage des données pour l'upsert
  const payload = profils.map(p => {
    const { id, ...rest } = p;
    return rest; 
  });

  const { error } = await client.from('profiles').upsert(payload, { onConflict: 'publicId' });
  if (error) {
    console.error("Erreur peuplement:", error);
    throw error;
  }
};

export const obtenirProfilsPublics = async (): Promise<Profil[]> => {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('is_public', true)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });
  return error ? [] : (data as Profil[]);
};

export const obtenirProfils = async (): Promise<Profil[]> => {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  return error ? [] : (data as Profil[]);
};

export const sauvegarderProfil = async (donnees: Profil | Partial<Profil>): Promise<Profil> => {
  const client = getSupabase();
  if (!client) throw new Error("Supabase non disponible.");
  
  const payload = { ...donnees };
  // Retirer l'ID s'il est vide ou trop court (ID temporaire client)
  if (payload.id && (typeof payload.id !== 'string' || payload.id.length < 5)) {
    delete payload.id;
  }

  const { data, error } = await client
    .from('profiles')
    .upsert(payload, { onConflict: 'publicId' })
    .select()
    .single();

  if (error) {
    console.error("Erreur sauvegarde:", error);
    throw error;
  }
  return data as Profil;
};

export const obtenirProfilParIdPublic = async (publicId: string): Promise<Profil | null> => {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client.from('profiles').select('*').eq('publicId', publicId).single();
  if (error) return null;
  return data as Profil;
};

export const supprimerProfil = async (id: string): Promise<void> => {
  const client = getSupabase();
  if (!client) return;
  const { error } = await client.from('profiles').delete().eq('id', id);
  if (error) throw error;
};

export const basculerArchiveProfil = async (id: string): Promise<void> => {
  const client = getSupabase();
  if (!client) return;
  const { data: cur } = await client.from('profiles').select('is_archived').eq('id', id).single();
  if (cur) {
    const { error } = await client.from('profiles').update({ is_archived: !cur.is_archived }).eq('id', id);
    if (error) throw error;
  }
};

export const incrementerStatistique = async (publicId: string, stat: string): Promise<void> => {
  const client = getSupabase();
  if (!client) return;
  const { data } = await client.from('profiles').select(stat).eq('publicId', publicId).single();
  if (data) {
    const val = (data as any)[stat] || 0;
    await client.from('profiles').update({ [stat]: val + 1 }).eq('publicId', publicId);
  }
};

export const obtenirCommentaires = async (publicId: string): Promise<Commentaire[]> => {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from('comments')
    .select('*')
    .eq('profile_public_id', publicId)
    .order('created_at', { ascending: true });
  if (error) return [];
  return data as Commentaire[];
};

export const ajouterCommentaire = async (publicId: string, auteur: string, contenu: string): Promise<Commentaire | null> => {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client
    .from('comments')
    .insert({
      profile_public_id: publicId,
      author_name: auteur,
      content: contenu,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  if (error) throw error;
  return data as Commentaire;
};
