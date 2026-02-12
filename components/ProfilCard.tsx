
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MoveRight, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Profile } from '../types.ts';

interface ProfilCardProps {
  profil: Profile;
  index: number;
}

const ProfilCard: React.FC<ProfilCardProps> = ({ profil, index }) => {
  // Une carte sur 4 est large (si l'index le permet dans la grille)
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
        className={`group relative flex flex-col h-full bg-white border border-stone-200/60 p-10 rounded-[2.5rem] paper-shadow hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] transition-all duration-700 ease-out overflow-hidden active:scale-[0.98] w-full ${isLarge ? 'max-w-3xl' : 'max-w-md'}`}
      >
        {/* Badge d'urgence dynamique */}
        {hasUrgentNeeds && (
          <div className="absolute top-8 right-8 z-20 flex items-center gap-2 px-4 py-1.5 bg-amber-500 text-white rounded-full shadow-lg border-2 border-white">
            <motion.div 
              animate={{ opacity: [1, 0.4, 1] }} 
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-white rounded-full" 
            />
            <span className="text-[9px] font-black uppercase tracking-widest">Urgence Terrain</span>
          </div>
        )}

        <div className="relative z-10 flex flex-col h-full space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-8">
            <div className={`shrink-0 overflow-hidden rounded-[2rem] bg-stone-50 border border-stone-100 transition-all duration-1000 ${isLarge ? 'w-40 h-40' : 'w-24 h-24'}`}>
              {profil.image_url ? (
                <img 
                  src={profil.image_url} 
                  alt={profil.name} 
                  className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-in-out"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-200 bg-stone-50">
                  <User className="w-10 h-10" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className={`font-serif font-black text-stone-900 leading-none tracking-tight transition-all duration-500 uppercase ${isLarge ? 'text-5xl md:text-6xl' : 'text-4xl'}`}>
                {profil.name}
              </h3>
              <div className="flex items-center gap-2 text-stone-400 text-[10px] font-bold uppercase tracking-[0.25em] group-hover:text-blue-600 transition-colors">
                <MapPin className="w-3 h-3" />
                {profil.usual_place.split(',')[0]}
              </div>
            </div>
          </div>

          <p className={`font-serif italic text-stone-600 leading-relaxed opacity-80 group-hover:opacity-100 transition-all duration-500 ${isLarge ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
            « {profil.reformulated_story.substring(0, isLarge ? 200 : 120)}... »
          </p>

          <footer className="mt-auto pt-8 border-t border-stone-50 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">Existence Archive</span>
              <span className="font-mono text-[11px] text-stone-400">REF-{profil.publicId.split('-').pop()?.toUpperCase()}</span>
            </div>
            
            <div className="flex items-center gap-4 text-stone-900 font-black text-[10px] uppercase tracking-[0.2em] group-hover:gap-6 transition-all duration-500">
              Consulter <MoveRight className="w-5 h-5 text-blue-600" />
            </div>
          </footer>
        </div>
      </Link>
    </motion.div>
  );
};

export default React.memo(ProfilCard);
