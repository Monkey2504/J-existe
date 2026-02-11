
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  ArrowRight, 
  AlertCircle, 
  User,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Profile } from '../types.ts';

interface ProfilCardProps {
  profil: Profile;
}

const ProfilCard: React.FC<ProfilCardProps> = ({ 
  profil, 
}) => {
  // Détecter si le profil a besoin urgent
  const hasUrgentNeeds = profil.metadata?.urgency_score && profil.metadata.urgency_score >= 8;
  
  // Extraire les premiers mots du récit
  const getExcerpt = (text: string, maxLength: number = 120) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Formater les besoins (limiter à 2)
  const besoinsList = profil.besoins_immediats || profil.metadata?.immediate_needs || [];
  const displayedNeeds = besoinsList.slice(0, 2);
  const hasMoreNeeds = besoinsList.length > 2;

  const storyContent = profil.reformulated_story || profil.recit_reformule || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={`/p/${profil.publicId}`}
        className="group block relative overflow-hidden rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-stone-500/20 focus:border-stone-300"
        aria-label={`Voir le profil de ${profil.name}`}
      >
        {/* Badge d'urgence */}
        {hasUrgentNeeds && (
          <div className="absolute top-4 left-4 z-20">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
              <AlertCircle className="w-3 h-3" />
              <span>Urgent</span>
            </div>
          </div>
        )}

        {/* Badge de vérification */}
        {profil.is_verified && (
          <div className="absolute top-4 right-4 z-20">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-stone-500 to-stone-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
              <Shield className="w-3 h-3" />
              <span>Vérifié</span>
            </div>
          </div>
        )}

        {/* Contenu principal */}
        <div className="p-6 md:p-8">
          <div className="flex flex-col h-full">
            {/* En-tête avec nom et avatar */}
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center shadow-md">
                    <User className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-stone-900 group-hover:text-stone-700 transition-colors truncate">
                      {profil.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-stone-500">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{profil.usual_place}</span>
                    </div>
                  </div>
                  
                  <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-stone-900 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                </div>
              </div>
            </div>

            {/* Récit de vie */}
            <div className="mb-6 flex-1">
              <p className="text-stone-600 leading-relaxed italic line-clamp-3 font-serif">
                "{getExcerpt(storyContent)}"
              </p>
            </div>

            {/* Footer de la carte : besoins */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-50">
              <div className="flex flex-wrap gap-2">
                {displayedNeeds.map((need, idx) => (
                  <span key={idx} className="px-2 py-1 bg-stone-100 text-stone-600 text-[10px] rounded-md font-bold uppercase tracking-wider">
                    {need}
                  </span>
                ))}
                {hasMoreNeeds && (
                  <span className="text-[10px] text-stone-400 font-bold">...</span>
                )}
              </div>
              
              {profil.views !== undefined && (
                <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                  {profil.views} vue{profil.views > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProfilCard;
