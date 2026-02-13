
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Profil } from '../types.ts';

// Vos clés de production pour le projet dhdvmiimtauebnflmgxa
const SUPABASE_URL = "https://dhdvmiimtauebnflmgxa.supabase.co";
const SUPABASE_KEY = "sb_publishable_kBpi1JNqSfBeu7cvxLxpVg_rCQxJdbb";

let supabaseInstance: SupabaseClient | null = null;

/**
 * Initialise le client avec vos clés spécifiques.
 */
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

/**
 * Teste si la table 'profiles' est accessible sur votre nouveau projet.
 */
export const testerConnexion = async (): Promise<{ ok: boolean; message: string; url: string }> => {
  const client = getSupabase();
  if (!client) return { ok: false, message: "Client non initialisé.", url: SUPABASE_URL };

  try {
    const { error } = await client.from('profiles').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return { ok: false, message: "La table 'profiles' n'existe pas sur ce projet. Créez-la pour continuer.", url: SUPABASE_URL };
      }
      throw error;
    }
    return { ok: true, message: "Connecté avec succès à votre projet Supabase.", url: SUPABASE_URL };
  } catch (e: any) {
    return { ok: false, message: e.message || "Erreur de liaison réseau.", url: SUPABASE_URL };
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

export const sauvegarderProfil = async (donnees: Profil): Promise<Profil> => {
  const client = getSupabase();
  if (!client) throw new Error("Supabase non disponible.");
  
  const payload = { ...donnees };
  // On s'assure de ne pas envoyer d'ID vide pour laisser Supabase générer l'UUID
  if (!donnees.id || donnees.id.length < 5) {
    delete (payload as any).id;
  }

  const { data, error } = await client
    .from('profiles')
    .upsert(payload, { onConflict: 'publicId' })
    .select()
    .single();

  if (error) throw error;
  return data as Profil;
};

export const peuplerSupabase = async (profils: Profil[]): Promise<void> => {
  const client = getSupabase();
  if (!client) throw new Error("Supabase non disponible.");

  // Nettoyage des données pour l'injection initiale
  const sanitized = profils.map(p => {
    const { id, ...rest } = p;
    return rest;
  });

  const { error } = await client.from('profiles').upsert(sanitized, { onConflict: 'publicId' });
  if (error) throw error;
};

export const obtenirProfilParIdPublic = async (publicId: string): Promise<Profil | null> => {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client.from('profiles').select('*').eq('publicId', publicId).single();
  return error ? null : (data as Profil);
};

export const supprimerProfil = async (id: string): Promise<void> => {
  const client = getSupabase();
  if (!client) return;
  await client.from('profiles').delete().eq('id', id);
};

export const basculerArchiveProfil = async (id: string): Promise<void> => {
  const client = getSupabase();
  if (!client) return;
  const { data: cur } = await client.from('profiles').select('is_archived').eq('id', id).single();
  if (cur) await client.from('profiles').update({ is_archived: !cur.is_archived }).eq('id', id);
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
