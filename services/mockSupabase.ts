
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Profil } from '../types.ts';

// On évite d'instancier directement ici pour ne pas crasher au démarrage
let supabaseInstance: SupabaseClient | null = null;

/**
 * Récupère ou initialise l'instance Supabase de manière sécurisée
 */
export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  const url = (process.env as any).SUPABASE_URL || '';
  const key = (process.env as any).SUPABASE_ANON_KEY || '';

  if (!url || !key || url === "" || key === "") {
    console.warn("Supabase non configuré : URL ou Clé manquante.");
    return null;
  }

  try {
    supabaseInstance = createClient(url, key);
    return supabaseInstance;
  } catch (e) {
    console.error("Erreur d'initialisation Supabase:", e);
    return null;
  }
};

/**
 * Vérifie si la connexion à Supabase est active
 */
export const testerConnexion = async (): Promise<{ ok: boolean; message: string }> => {
  const client = getSupabase();
  if (!client) {
    return { 
      ok: false, 
      message: "Configuration manquante : Veuillez renseigner SUPABASE_URL et SUPABASE_ANON_KEY." 
    };
  }

  try {
    const { error } = await client.from('profiles').select('id').limit(1);
    if (error) throw error;
    return { ok: true, message: "Connecté à Supabase" };
  } catch (e: any) {
    return { ok: false, message: `Erreur Supabase : ${e.message || "Impossible de joindre la table 'profiles'"}` };
  }
};

/**
 * Pousse les 10 profils de base vers Supabase
 */
export const peuplerSupabase = async (profils: Profil[]): Promise<void> => {
  const client = getSupabase();
  if (!client) throw new Error("Supabase non configuré.");

  const { error } = await client.from('profiles').upsert(
    profils.map(p => {
      const { id, ...rest } = p;
      return rest; 
    }), 
    { onConflict: 'publicId' }
  );
  if (error) throw error;
};

export const obtenirProfils = async (): Promise<Profil[]> => {
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Erreur Supabase:", error);
    return [];
  }
  return data as Profil[];
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

  if (error) {
    console.error("Erreur Supabase Public:", error);
    return [];
  }
  return data as Profil[];
};

export const obtenirProfilParIdPublic = async (publicId: string): Promise<Profil | null> => {
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('publicId', publicId)
    .single();

  if (error) {
    console.error("Erreur Profil Individuel:", error);
    return null;
  }
  return data as Profil;
};

export const sauvegarderProfil = async (donneesProfil: Profil): Promise<Profil> => {
  const client = getSupabase();
  if (!client) throw new Error("Supabase non configuré.");

  const isUpdate = !!donneesProfil.id && donneesProfil.id.length > 5;
  
  const payload = { ...donneesProfil };
  if (!isUpdate) delete (payload as any).id; 

  const { data, error } = await client
    .from('profiles')
    .upsert(payload, { onConflict: 'publicId' })
    .select()
    .single();

  if (error) {
    console.error("Erreur Sauvegarde Supabase:", error);
    throw error;
  }
  return data as Profil;
};

export const supprimerProfil = async (id: string): Promise<void> => {
  const client = getSupabase();
  if (!client) return;

  const { error } = await client
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const basculerArchiveProfil = async (id: string): Promise<void> => {
  const client = getSupabase();
  if (!client) return;

  const { data: current } = await client
    .from('profiles')
    .select('is_archived')
    .eq('id', id)
    .single();

  if (current) {
    await client
      .from('profiles')
      .update({ is_archived: !current.is_archived })
      .eq('id', id);
  }
};

export const incrementerStatistique = async (publicId: string, stat: 'views' | 'needs_clicks' | 'shares_count'): Promise<void> => {
  const client = getSupabase();
  if (!client) return;

  const { data } = await client
    .from('profiles')
    .select(stat)
    .eq('publicId', publicId)
    .single();

  if (data) {
    const newVal = (data[stat] || 0) + 1;
    await client
      .from('profiles')
      .update({ [stat]: newVal })
      .eq('publicId', publicId);
  }
};
