
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Hash, ArrowUp } from 'lucide-react';

import ProfilCard from '../components/ProfilCard.tsx';
import { obtenirProfilsPublics } from '../services/mockSupabase.ts';
import { Profil, LieuGroupe } from '../types.ts';

/**
 * Hook personnalisé pour charger et filtrer la liste des profils.
 */
const useGestionListeProfils = () => {
  const [listeProfils, setListeProfils] = useState<Profil[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState('');
  const [rechercheDebouncee, setRechercheDebouncee] = useState('');

  // Logique de debounce pour éviter les calculs à chaque frappe
  useEffect(() => {
    const timer = setTimeout(() => setRechercheDebouncee(recherche), 300);
    return () => clearTimeout(timer);
  }, [recherche]);

  const recupererProfils = useCallback(async (signal?: AbortSignal) => {
    try {
      setChargement(true);
      const donnees = await obtenirProfilsPublics();
      if (signal?.aborted) return;
      setListeProfils(donnees);
    } catch (err) {
      if (signal?.aborted) return;
      setErreur('Défaillance du registre central.');
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    const controleur = new AbortController();
    recupererProfils(controleur.signal);
    return () => controleur.abort();
  }, [recupererProfils]);

  const profilsFiltres = useMemo(() => {
    const terme = rechercheDebouncee.toLowerCase();
    return listeProfils.filter(p => p.name.toLowerCase().includes(terme) || p.usual_place.toLowerCase().includes(terme));
  }, [listeProfils, rechercheDebouncee]);

  const groupes = useMemo<LieuGroupe[]>(() => {
    const map = new Map<string, LieuGroupe>();
    profilsFiltres.forEach(p => {
      const lieu = p.usual_place.split(',')[0].trim();
      if (!map.has(lieu)) {
        map.set(lieu, { nom: lieu, description: '', profils: [], count: 0, urgentCount: 0 });
      }
      const g = map.get(lieu)!;
      g.profils.push(p);
      g.count++;
      if (p.urgent_needs?.length) g.urgentCount++;
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [profilsFiltres]);

  return { groupes, chargement, erreur, recherche, setRecherche, reessayer: recupererProfils };
};

const HeaderListe = React.memo(() => (
  <header className="pt-32 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center">
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex items-center gap-3">
        <div className="h-[1px] w-12 bg-blue-600" aria-hidden="true" />
        <span className="font-mono text-[10px] font-black text-blue-600 uppercase tracking-[0.5em]">Registre Social Régional</span>
        <div className="h-[1px] w-12 bg-blue-600" aria-hidden="true" />
      </div>
      <h1 className="text-[12vw] md:text-[8vw] font-impact text-stone-900 dark:text-white leading-[0.75] tracking-tighter uppercase">
        L'INDEX DES <br /> <span className="text-stone-300 dark:text-stone-700">EXISTENCES</span>
      </h1>
      <p className="max-w-xl font-serif italic text-xl text-stone-500 mt-8">
        Recensement numérique des visages invisibles de la capitale. Chaque dossier est une vie qui réclame sa place.
      </p>
    </div>
  </header>
));
HeaderListe.displayName = 'HeaderListe';

const BarreRecherche = React.memo(({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="sticky top-24 z-40 px-6 py-4 flex justify-center pointer-events-none">
    <div className="pointer-events-auto bg-stone-900/95 dark:bg-stone-800/95 backdrop-blur-xl rounded-full px-8 py-4 flex items-center gap-4 shadow-2xl border border-white/10 w-full max-w-2xl" role="search">
      <Search className="w-4 h-4 text-stone-400" aria-hidden="true" />
      <label htmlFor="search-profiles" className="sr-only">Rechercher un dossier</label>
      <input
        id="search-profiles"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="RECHERCHER UN NOM OU UN LIEU..."
        className="bg-transparent border-none outline-none text-white font-mono text-xs uppercase tracking-widest placeholder:text-stone-600 w-full"
      />
    </div>
  </div>
));
BarreRecherche.displayName = 'BarreRecherche';

const EnteteGroupe = React.memo(({ group }: { group: LieuGroupe }) => (
  <div className="mb-20 flex flex-col items-center">
    <div className="relative flex items-center justify-center w-full">
      <div className="text-[10vw] font-impact text-stone-900 dark:text-white opacity-[0.02] absolute uppercase tracking-tighter whitespace-nowrap select-none" aria-hidden="true">
        {group.nom}
      </div>
      <div className="relative z-10 bg-[#fdfcfb] dark:bg-stone-950 px-12 py-4 border-x-2 border-stone-100 dark:border-stone-900 flex flex-col items-center gap-2">
        <h3 className="text-4xl md:text-5xl font-impact text-stone-900 dark:text-white uppercase tracking-tight">{group.nom}</h3>
        <span className="font-mono text-[9px] text-stone-400 uppercase tracking-[0.3em] font-bold">
          {group.count} dossiers indexés • {group.urgentCount} urgences
        </span>
      </div>
    </div>
  </div>
));
EnteteGroupe.displayName = 'EnteteGroupe';

const ProfilesListingPage: React.FC = () => {
  const { groupes, chargement, erreur, recherche, setRecherche } = useGestionListeProfils();
  const refHaut = useRef<HTMLDivElement>(null);

  if (chargement) return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center" role="status" aria-live="polite">
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="font-impact text-white text-7xl uppercase tracking-widest">
        Inventaire...
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdfcfb] dark:bg-stone-950 pb-40 grainy admin-grid" ref={refHaut}>
      <HeaderListe />
      <BarreRecherche value={recherche} onChange={setRecherche} />

      <main className="max-w-7xl mx-auto px-6 mt-32 space-y-48" aria-busy={chargement}>
        {groupes.length === 0 ? (
          <div className="py-40 text-center" role="status">
            <Hash className="w-12 h-12 text-stone-200 mx-auto mb-8" aria-hidden="true" />
            <h3 className="text-4xl font-impact text-stone-300 uppercase">Silence dans les archives</h3>
            <button 
              onClick={() => setRecherche('')} 
              className="mt-8 font-black text-[10px] text-blue-600 uppercase tracking-widest hover:underline"
            >
              Réinitialiser l'index
            </button>
          </div>
        ) : (
          groupes.map((groupe) => (
            <section key={groupe.nom} className="flex flex-col items-center" aria-labelledby={`group-${groupe.nom}`}>
              <EnteteGroupe group={groupe} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full">
                {groupe.profils.map((p, idx) => (
                  <ProfilCard key={p.id} profil={p} index={idx} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-stone-900 text-white p-6 rounded-full paper-shadow hover:scale-110 transition-transform active:scale-95 group focus:ring-4 focus:ring-blue-600 outline-none"
          aria-label="Retour en haut de page"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

ProfilesListingPage.displayName = 'ProfilesListingPage';
export default React.memo(ProfilesListingPage);
