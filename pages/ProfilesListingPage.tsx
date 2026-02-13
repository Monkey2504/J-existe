
import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Hash, ArrowUp } from 'lucide-react';

import ProfilCard from '../components/ProfilCard.tsx';
import { obtenirProfilsPublics } from '../services/supabaseService.ts';
import { Profil, LieuGroupe } from '../types.ts';

// Composant Skeleton pour un chargement plus élégant
const ProfilSkeleton = () => (
  <div className="w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[3rem] p-10 space-y-8 animate-pulse">
    <div className="flex gap-6 items-center">
      <div className="w-24 h-24 bg-stone-100 dark:bg-stone-800 rounded-3xl" />
      <div className="space-y-3 flex-1">
        <div className="h-8 bg-stone-100 dark:bg-stone-800 rounded-lg w-3/4" />
        <div className="h-4 bg-stone-100 dark:bg-stone-800 rounded-lg w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-stone-100 dark:bg-stone-800 rounded-lg w-full" />
      <div className="h-4 bg-stone-100 dark:bg-stone-800 rounded-lg w-5/6" />
      <div className="h-4 bg-stone-100 dark:bg-stone-800 rounded-lg w-4/6" />
    </div>
  </div>
);

const ProfilesListingPage: React.FC = () => {
  const [listeProfils, setListeProfils] = useState<Profil[]>([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');

  useEffect(() => {
    // On tente de récupérer le cache immédiatement
    const fetchProfiles = async () => {
      // Premier appel : essaie de prendre le cache
      const cachedData = await obtenirProfilsPublics();
      if (cachedData.length > 0) {
        setListeProfils(cachedData);
        setChargement(false);
      }

      // Deuxième appel (background) : rafraîchit les données depuis le serveur
      const freshData = await obtenirProfilsPublics(true);
      setListeProfils(freshData);
      setChargement(false);
    };

    fetchProfiles();
  }, []);

  const profilsFiltres = useMemo(() => {
    const t = recherche.toLowerCase();
    return listeProfils.filter(p => 
      p.name.toLowerCase().includes(t) || 
      (p.usual_place || "").toLowerCase().includes(t)
    );
  }, [listeProfils, recherche]);

  const groupes = useMemo<LieuGroupe[]>(() => {
    const map = new Map<string, LieuGroupe>();
    profilsFiltres.forEach(p => {
      const lieu = (p.usual_place || "Bruxelles").split(',')[0].trim();
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

  return (
    <div className="min-h-screen bg-[#fdfcfb] dark:bg-stone-950 pb-40 transition-colors">
      <header className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center space-y-8">
        <h1 className="text-8xl md:text-9xl font-impact text-stone-900 dark:text-white uppercase leading-none tracking-tighter">
          L'INDEX DES <span className="text-stone-300 dark:text-stone-700">EXISTENCES</span>
        </h1>
      </header>

      {/* Toolbar minimaliste */}
      <div className="sticky top-24 z-40 px-6 py-4 flex flex-col items-center gap-6">
        <div className="bg-stone-900/90 dark:bg-stone-800/90 backdrop-blur-xl rounded-full px-8 py-4 flex items-center gap-6 shadow-2xl border border-white/10 w-full max-w-3xl">
          <Search className="w-5 h-5 text-stone-500" />
          <input 
            type="search" 
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            placeholder="RECHERCHER..."
            className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs uppercase tracking-widest placeholder:text-stone-600"
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 mt-32">
        <div className="space-y-48">
          {chargement && listeProfils.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[1, 2, 3, 4, 5, 6].map(i => <ProfilSkeleton key={i} />)}
            </div>
          ) : groupes.length === 0 ? (
            <div className="py-40 text-center space-y-8">
              <Hash className="w-16 h-16 text-stone-200 mx-auto" />
              <h3 className="text-4xl font-impact text-stone-300 uppercase">Aucun profil trouvé</h3>
            </div>
          ) : (
            groupes.map(groupe => (
              <section key={groupe.nom} className="space-y-20">
                <div className="flex flex-col items-center">
                  <h2 className="text-6xl font-impact text-stone-900 dark:text-white uppercase tracking-tight">{groupe.nom}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {groupe.profils.map((p, idx) => (
                    <ProfilCard key={p.id} profil={p} index={idx} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-12 right-12 p-6 bg-stone-900 text-white rounded-full paper-shadow hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
      </button>
    </div>
  );
};

export default React.memo(ProfilesListingPage);
