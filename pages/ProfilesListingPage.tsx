
import React, { useEffect, useState, useMemo } from 'react';
import ProfilCard from '../components/ProfilCard.tsx';
import { Search, MapPin, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPublicProfiles } from '../services/mockSupabase.ts';
import { Profile, LieuGroupe } from '../types.ts';

const ProfilesListingPage: React.FC = () => {
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    getPublicProfiles().then(data => {
      setAllProfiles(data);
      setLoading(false);
    });
  }, []);

  const groups = useMemo(() => {
    const res: Record<string, LieuGroupe> = {};
    allProfiles.forEach(p => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return;
      const key = p.usual_place || "Bruxelles";
      if (!res[key]) res[key] = { nom: key, description: '', profils: [], count: 0, urgentCount: 0 };
      res[key].profils.push(p);
      res[key].count++;
    });
    return Object.values(res);
  }, [allProfiles, query]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900">
      <motion.div 
        animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 1, 0.5] }} 
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="font-impact text-white text-7xl tracking-tighter"
      >
        L'INDEX S'OUVRE...
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f7f4] pb-40">
      {/* Barre de recherche flottante ultra-minimaliste */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 py-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-end">
          <div className="pointer-events-auto bg-white/80 backdrop-blur-2xl paper-shadow rounded-full px-6 py-3 border border-stone-100 flex items-center gap-4">
            <Search className="w-4 h-4 text-stone-300" />
            <input 
              type="text"
              placeholder="Chercher un nom..."
              className="bg-transparent border-none outline-none font-bold text-[10px] uppercase tracking-widest w-40 md:w-64 placeholder:text-stone-300"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <header className="pt-40 pb-24 px-6 max-w-7xl mx-auto border-b border-stone-100">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-col gap-4"
        >
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em]">Registre de Visibilité</span>
          <h1 className="text-[15vw] md:text-[10vw] font-impact text-stone-900 leading-[0.8] tracking-tighter">
            LES VISAGES <br/> <span className="text-stone-200">DE BRUXELLES</span>
          </h1>
        </motion.div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-24 space-y-40">
        {groups.map((group, groupIdx) => (
          <section key={group.nom} className="relative">
            {/* Header de section sculptural */}
            <div className="sticky top-24 z-10 mb-16 pointer-events-none">
              <div className="flex items-baseline gap-4">
                <h2 className="text-8xl md:text-9xl font-impact text-stone-900 opacity-[0.03] leading-none absolute -left-4 -top-8 select-none">
                  {group.nom.split(',')[0]}
                </h2>
                <div className="relative pl-4 border-l-2 border-stone-900">
                   <h2 className="text-2xl font-serif font-black italic text-stone-900">{group.nom}</h2>
                   <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{group.count} Présences actives</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {group.profils.map((p, pIdx) => (
                <ProfilCard key={p.id} profil={p} index={pIdx} />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Navigation Flottante "Design Studio" */}
      <footer className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50">
        <nav className="bg-stone-900 px-10 py-5 rounded-full flex gap-12 items-center paper-shadow transition-transform hover:scale-105">
           <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-[10px] font-black text-white uppercase tracking-widest hover:text-blue-400 transition-colors">Index</button>
           <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
           <button onClick={() => window.history.back()} className="text-[10px] font-black text-stone-500 uppercase tracking-widest hover:text-white transition-colors">Retour</button>
        </nav>
      </footer>
    </div>
  );
};

export default ProfilesListingPage;
