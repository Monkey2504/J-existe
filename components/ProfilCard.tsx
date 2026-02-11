
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MoveRight, User, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Profile } from '../types.ts';

interface ProfilCardProps {
  profil: Profile;
  index: number;
}

const ProfilCard: React.FC<ProfilCardProps> = ({ profil, index }) => {
  const isLarge = index % 4 === 0;
  const hasUrgentNeeds = profil.urgent_needs && profil.urgent_needs.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.1 }}
      className={`${isLarge ? 'md:col-span-2' : 'md:col-span-1'}`}
    >
      <Link
        to={`/p/${profil.publicId}`}
        className="group relative flex flex-col h-full bg-white border border-stone-100 p-8 rounded-[2.5rem] paper-shadow hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 ease-out overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-50 transition-colors duration-700" />

        {hasUrgentNeeds && (
          <div className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white rounded-full shadow-lg scale-90 md:scale-100">
            <Zap className="w-3 h-3 fill-white" />
            <span className="text-[8px] font-black uppercase tracking-widest">Urgent</span>
          </div>
        )}

        <div className="relative z-10 flex flex-col h-full space-y-6">
          <div className="flex items-center gap-6">
            <div className={`shrink-0 overflow-hidden rounded-2xl bg-stone-100 border border-stone-100 transition-all duration-700 group-hover:scale-105 ${isLarge ? 'w-32 h-32' : 'w-20 h-20'}`}>
              {profil.image_url ? (
                <img 
                  src={profil.image_url} 
                  alt={profil.name} 
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300">
                  <User className="w-8 h-8" />
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <h3 className={`font-serif font-black text-stone-900 leading-none tracking-tight transition-all duration-500 uppercase ${isLarge ? 'text-5xl' : 'text-3xl'}`}>
                {profil.name}
              </h3>
              <div className="flex items-center gap-2 text-stone-300 text-[9px] font-bold uppercase tracking-[0.2em] group-hover:text-blue-400 transition-colors">
                <MapPin className="w-3 h-3" />
                {profil.usual_place.split(',')[0]}
              </div>
            </div>
          </div>

          <p className={`font-serif italic text-stone-600 leading-relaxed opacity-70 group-hover:opacity-100 transition-all duration-700 ${isLarge ? 'text-2xl' : 'text-lg'}`}>
            « {profil.reformulated_story.substring(0, isLarge ? 180 : 100)}... »
          </p>

          <footer className="mt-auto pt-6 border-t border-stone-50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-stone-200 uppercase tracking-widest">Dignité n°</span>
              <span className="font-mono text-xs text-stone-400">BXL-{index + 101}</span>
            </div>
            
            <div className="flex items-center gap-2 text-stone-900 font-extrabold text-[9px] uppercase tracking-[0.3em] group-hover:translate-x-2 transition-transform duration-500">
              Son histoire <MoveRight className="w-4 h-4 text-blue-600" />
            </div>
          </footer>
        </div>
      </Link>
    </motion.div>
  );
};

export default React.memo(ProfilCard);
