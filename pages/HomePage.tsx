
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Search, ArrowRight, Zap } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showTools, setShowTools] = useState(false);

  return (
    <div className="bg-[#fdfcfb] dark:bg-stone-950 min-h-screen flex flex-col overflow-hidden select-none items-center justify-center relative">
      <AnimatePresence mode="wait">
        {!showTools ? (
          /* LE CRI : Uniquement le message, occupant tout l'espace */
          <motion.div
            key="cry"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(40px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-screen flex flex-col items-center justify-center cursor-pointer group px-4"
            onClick={() => setShowTools(true)}
          >
            <motion.h1 
              whileHover={{ scale: 1.05 }}
              className="text-[32vw] md:text-[28vw] font-impact leading-[0.7] text-stone-900 dark:text-white uppercase tracking-tighter text-center transition-all group-hover:tracking-[-0.05em]"
            >
              J'EXISTE
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 1 }}
              className="absolute bottom-20 flex flex-col items-center gap-4"
            >
              <div className="w-px h-16 bg-stone-400 dark:bg-stone-600 animate-pulse" />
              <span className="font-mono text-[9px] uppercase tracking-[0.6em] text-stone-500">Cliquer pour répondre</span>
            </motion.div>
          </motion.div>
        ) : (
          /* LES OUTILS : Révélés après le choc visuel */
          <motion.div
            key="tools"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-6xl w-full px-6 py-20 flex flex-col items-center gap-16"
          >
            <header className="text-center space-y-6">
              <div className="dymo-label bg-blue-600 mb-4 mx-auto">UNITÉ D'INDEXATION SOCIALE</div>
              <h2 className="text-4xl md:text-7xl font-impact text-stone-900 dark:text-white uppercase tracking-tight">
                AGIR POUR LA <span className="text-blue-600 italic">DIGNITÉ</span>
              </h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <button
                onClick={() => navigate('/je-cree-ma-fiche')}
                className="group relative bg-blue-600 p-12 rounded-[4rem] text-left transition-all hover:scale-[1.02] shadow-2xl flex flex-col justify-between h-[480px] overflow-hidden"
              >
                <div className="space-y-4 relative z-10">
                  <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-white mb-8">
                    <PlusCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-5xl font-impact text-white uppercase leading-none">INDEXER UN<br/>PARCOURS</h3>
                  <p className="text-blue-100 font-serif italic text-xl max-w-xs leading-relaxed">Identifier une rencontre, documenter les besoins, briser l'anonymat de la rue.</p>
                </div>
                <div className="flex items-center gap-3 text-white font-black text-[11px] uppercase tracking-[0.3em] relative z-10">
                  Démarrer l'indexation <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
                </div>
                <div className="absolute -bottom-10 -right-10 text-white/5 font-impact text-[280px] rotate-[-15deg] pointer-events-none select-none">ADD</div>
              </button>

              <button
                onClick={() => navigate('/profiles')}
                className="group relative bg-stone-900 dark:bg-white p-12 rounded-[4rem] text-left transition-all hover:scale-[1.02] shadow-2xl flex flex-col justify-between h-[480px] overflow-hidden"
              >
                <div className="space-y-4 relative z-10">
                  <div className="w-16 h-16 bg-blue-600/10 dark:bg-stone-100 rounded-3xl flex items-center justify-center text-blue-600 mb-8">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-5xl font-impact text-white dark:text-stone-900 uppercase leading-none">EXPLORER<br/>L'INDEX</h3>
                  <p className="text-stone-400 dark:text-stone-500 font-serif italic text-xl max-w-xs leading-relaxed">Consulter les dossiers d'existence et financer les besoins prioritaires.</p>
                </div>
                <div className="flex items-center gap-3 text-blue-500 font-black text-[11px] uppercase tracking-[0.3em] relative z-10">
                  Consulter l'index humain <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
                </div>
                <div className="absolute -bottom-10 -right-10 text-white/5 dark:text-stone-100 font-impact text-[280px] rotate-[-15deg] pointer-events-none select-none">DATA</div>
              </button>
            </div>

            <button 
              onClick={() => setShowTools(false)}
              className="mt-12 font-mono text-[9px] uppercase tracking-[0.8em] text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              ← Revenir au cri original
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-10 left-10 right-10 flex flex-col md:flex-row justify-between items-center gap-4 opacity-20 pointer-events-none">
        <div className="flex items-center gap-3">
          <Zap className="w-3 h-3 text-blue-600" />
          <span className="font-mono text-[8px] font-black uppercase tracking-widest">Bruxelles • Social Engineering Lab</span>
        </div>
        <div className="font-impact text-2xl tracking-tighter uppercase">J'EXISTE</div>
      </footer>
    </div>
  );
};

export default HomePage;
