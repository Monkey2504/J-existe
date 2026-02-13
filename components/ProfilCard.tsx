
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MoveRight, User, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';
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
        className={`group relative flex flex-col h-full bg-white border border-stone-200 rounded-[3rem] paper-shadow hover:shadow-[0_60px_120px_-20px_rgba(0,0,0,0.12)] transition-all duration-700 ease-[0.16,1,0.3,1] overflow-hidden active:scale-[0.98] w-full ${isLarge ? 'max-w-4xl' : 'max-w-md'}`}
      >
        <div className="flex items-center justify-between px-10 py-4 bg-stone-50 border-b border-stone-100/50">
           <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
             <span className="font-mono text-[10px] font-bold text-stone-400 tracking-tight uppercase">
               DOSSIER_ID: {profil.publicId.split('-').pop()?.toUpperCase() || 'UNKNOWN'}
             </span>
           </div>
           <Paperclip className="w-4 h-4 text-stone-300" />
        </div>

        <div className="p-10 md:p-14 flex flex-col h-full space-y-12">
          <div className="flex flex-col sm:flex-row gap-12 items-start">
            <div className="relative shrink-0 rotate-[-2deg] group-hover:rotate-0 transition-transform duration-700">
              <div className="w-36 h-36 md:w-44 md:h-44 bg-white p-4 shadow-2xl border border-stone-100">
                <div className="w-full h-full overflow-hidden bg-stone-100">
                  {profil.image_url ? (
                    <img src={profil.image_url} alt={profil.name} className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-200"><User className="w-12 h-12" /></div>
                  )}
                </div>
              </div>
              <div className="absolute -top-1 left-4 w-6 h-2 bg-stone-400/40 rounded-sm blur-[0.5px]" />
              <div className="absolute -top-1 right-4 w-6 h-2 bg-stone-400/40 rounded-sm blur-[0.5px]" />
            </div>
            
            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <h3 className={`font-impact text-stone-900 leading-[0.75] tracking-tighter uppercase transition-all duration-700 ${isLarge ? 'text-8xl' : 'text-6xl'}`}>
                  {profil.name}
                </h3>
                <div className="dymo-label text-[9px]">{profil.usual_place.split(',')[0]}</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-stone-100 group-hover:bg-blue-600 transition-colors duration-500" />
            <p className={`font-serif italic text-stone-600 leading-relaxed pl-10 pr-6 ${isLarge ? 'text-3xl' : 'text-2xl'}`}>
              « {profil.reformulated_story.substring(0, isLarge ? 280 : 150)}... »
            </p>
          </div>

          <footer className="mt-auto pt-12 flex items-center justify-between border-t border-stone-50">
            <div className="px-6 py-2.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Citoyen Indexé</span>
            </div>
            
            <div className="flex items-center gap-4 text-stone-900 font-black text-[11px] uppercase tracking-widest group-hover:gap-8 transition-all duration-500">
              Voir la trajectoire <MoveRight className="w-6 h-6 text-blue-600" />
            </div>
          </footer>
        </div>
      </Link>
    </motion.div>
  );
};

export default React.memo(ProfilCard);
