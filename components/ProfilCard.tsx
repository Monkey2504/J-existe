
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MoveRight, User, Hash, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';
// Fixed: Corrected type name according to types.ts
import { Profil } from '../types.ts';

interface ProfilCardProps {
  profil: Profil;
  index: number;
}

const ProfilCard: React.FC<ProfilCardProps> = ({ profil, index }) => {
  const isLarge = index % 4 === 0;
  const hasUrgentNeeds = profil.urgent_needs && profil.urgent_needs.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: (index % 3) * 0.05 }}
      className={`w-full flex justify-center ${isLarge ? 'md:col-span-2' : 'md:col-span-1'}`}
    >
      <Link
        to={`/p/${profil.publicId}`}
        className={`group relative flex flex-col h-full bg-white border border-stone-200 rounded-[2rem] paper-shadow hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 ease-[0.16,1,0.3,1] overflow-hidden active:scale-[0.98] w-full ${isLarge ? 'max-w-4xl' : 'max-w-md'}`}
      >
        {/* En-tête de carte "Archive Officielle" */}
        <div className="flex items-center justify-between px-8 py-3 bg-stone-50 border-b border-stone-100/50">
           <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
             <span className="font-mono text-[9px] font-bold text-stone-400 tracking-tight uppercase">
               FILE_ID: {profil.publicId.split('-').pop()?.toUpperCase() || 'UNKNOWN'}
             </span>
           </div>
           <div className="flex items-center gap-4">
              <span className="font-mono text-[8px] text-stone-300">REF: BXL_2024_{index.toString().padStart(3, '0')}</span>
              <Paperclip className="w-3 h-3 text-stone-300" />
           </div>
        </div>

        <div className="p-8 md:p-12 flex flex-col h-full space-y-10">
          <div className="flex flex-col sm:flex-row gap-10 items-start">
            {/* Photo style "Portrait d'Identité Agrafé" */}
            <div className="relative shrink-0 rotate-[-1.5deg] group-hover:rotate-0 transition-transform duration-700">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white p-3 shadow-xl border border-stone-100">
                <div className="w-full h-full overflow-hidden bg-stone-100">
                  {profil.image_url ? (
                    <img 
                      src={profil.image_url} 
                      alt={profil.name} 
                      className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-200">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>
              </div>
              {/* Simulation agrafes métalliques */}
              <div className="absolute -top-1 left-4 w-5 h-1.5 bg-stone-400/40 rounded-sm blur-[0.5px]" />
              <div className="absolute -top-1 right-4 w-5 h-1.5 bg-stone-400/40 rounded-sm blur-[0.5px]" />
            </div>
            
            <div className="space-y-4 flex-1">
              <div className="space-y-1">
                <h3 className={`font-impact text-stone-900 leading-[0.75] tracking-tighter uppercase transition-all duration-700 ${isLarge ? 'text-7xl md:text-8xl' : 'text-5xl md:text-6xl'}`}>
                  {profil.name}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="dymo-label text-[8px]">{profil.usual_place.split(',')[0]}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-stone-400 font-mono text-[10px] uppercase tracking-tighter">
                <MapPin className="w-3 h-3 text-blue-600" />
                Dernière localisation connue
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-stone-100 group-hover:bg-blue-600 transition-colors duration-500" />
            <p className={`font-serif italic text-stone-600 leading-relaxed pl-8 pr-4 ${isLarge ? 'text-2xl' : 'text-xl'}`}>
              « {profil.reformulated_story.substring(0, isLarge ? 220 : 120)}... »
            </p>
          </div>

          <footer className="mt-auto pt-10 flex items-center justify-between border-t border-stone-50">
            <div className="flex items-center gap-4">
               {hasUrgentNeeds ? (
                 <div className="px-5 py-2 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg flex items-center gap-2">
                   <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                   <span className="text-[9px] font-black uppercase tracking-[0.2em]">Soutien Prioritaire</span>
                 </div>
               ) : (
                 <span className="text-[9px] font-mono text-stone-300 uppercase tracking-widest">Status: Archivé</span>
               )}
            </div>
            
            <div className="flex items-center gap-4 text-stone-900 font-black text-[11px] uppercase tracking-widest group-hover:gap-6 transition-all duration-500">
              Ouvrir le dossier <MoveRight className="w-5 h-5 text-blue-600" />
            </div>
          </footer>
        </div>
      </Link>
    </motion.div>
  );
};

export default React.memo(ProfilCard);
