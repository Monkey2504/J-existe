
import React, { useEffect, useState, useMemo } from 'react';
import ProfilCard from '../components/ProfilCard.tsx';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPublicProfiles } from '../services/mockSupabase.ts';
import { Profile, LieuGroupe } from '../types.ts';
import { useNavigate } from 'react-router-dom';

const ProfilesListingPage: React.FC = () => {
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

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
      {/* Barre de recherche flottante centrée en haut */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 py-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-center">
          <div className="pointer-events-auto bg-white/90 backdrop-blur-2xl paper-shadow rounded-full px-8 py-4 border border-stone-100 flex items-center gap-4">
            <Search className="w-4 h-4 text-stone-300" />
            <input 
              type="text"
              placeholder="Chercher un nom..."
              className="bg-transparent border-none outline-none font-black text-[10px] uppercase tracking-widest w-48 md:w-80 placeholder:text-stone-300"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <header className="pt-48 pb-32 px-6 max-w-7xl mx-auto border-b border-stone-100 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="space-y-6"
        >
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.6em]">Registre de Visibilité Sociale</span>
          <h1 className="text-[14vw] md:text-[9vw] font-impact text-stone-900 leading-[0.75] tracking-tighter uppercase">
            LES VISAGES <br/> <span className="text-stone-200">DE BRUXELLES</span>
          </h1>
          <div className="w-24 h-1.5 bg-stone-900 mx-auto mt-8 rounded-full" />
        </motion.div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-32 space-y-60">
        {groups.map((group) => (
          <section key={group.nom} className="relative flex flex-col items-center">
            {/* Header de section sculptural centré */}
            <div className="mb-24 text-center relative w-full flex flex-col items-center">
              <h2 className="text-8xl md:text-[14rem] font-impact text-stone-900 opacity-[0.03] leading-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap z-0 uppercase tracking-tighter">
                {group.nom.split(',')[0]}
              </h2>
              <div className="relative z-10 flex flex-col items-center gap-4">
                 <h2 className="text-5xl md:text-7xl font-serif font-black italic text-stone-900 tracking-tight">{group.nom}</h2>
                 <div className="flex items-center gap-4">
                   <div className="w-16 h-[2px] bg-blue-600" />
                   <span className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em]">{group.count} Présences répertoriées</span>
                   <div className="w-16 h-[2px] bg-blue-600" />
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 w-full justify-items-center">
              {group.profils.map((p, pIdx) => (
                <ProfilCard key={p.id} profil={p} index={pIdx} />
              ))}
            </div>
          </section>
        ))}

        {groups.length === 0 && (
          <div className="py-60 text-center space-y-8 flex flex-col items-center">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center text-stone-300">
               <Search className="w-8 h-8" />
            </div>
            <h3 className="font-impact text-7xl text-stone-200 uppercase tracking-tighter">Silence dans l'index</h3>
            <p className="font-serif italic text-2xl text-stone-400 max-w-sm">Aucun nom ne correspond à votre recherche actuelle.</p>
            <button 
              onClick={() => setQuery('')}
              className="px-8 py-4 bg-stone-900 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all"
            >
              Réinitialiser
            </button>
          </div>
        )}
      </main>

      {/* Navigation Flottante Centrée */}
      <footer className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50">
        <nav className="bg-stone-900 px-12 py-6 rounded-full flex gap-12 items-center paper-shadow border border-white/10">
           <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-[10px] font-black text-white uppercase tracking-widest hover:text-blue-400 transition-colors">Remonter</button>
           <div className="w-2 h-2 bg-blue-600 rounded-full" />
           <button onClick={() => navigate('/')} className="text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-white transition-colors">Portail</button>
        </nav>
      </footer>
    </div>
  );
};

export default ProfilesListingPage;
