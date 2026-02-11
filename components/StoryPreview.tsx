
import React from 'react';
import { Profile } from '../types';
import { MapPin, ExternalLink } from 'lucide-react';

const StoryPreview: React.FC<{ profile: Profile }> = ({ profile }) => {
  return (
    <div className="p-8 border-2 border-dashed border-stone-200 rounded-3xl bg-stone-50">
      <div className="max-w-xl mx-auto space-y-8 text-center">
        <div className="space-y-1">
          <h3 className="text-3xl font-serif font-bold text-stone-900">{profile.name || "Nom du profil"}</h3>
          <div className="flex items-center justify-center gap-1 text-stone-400 text-xs font-bold uppercase tracking-widest">
            <MapPin className="w-3 h-3 text-blue-400" />
            {profile.usual_place || "Lieu non défini"}
          </div>
        </div>
        
        <p className="text-xl font-serif italic text-stone-700 leading-relaxed">
          « {profile.reformulated_story || "Le récit reformulé apparaîtra ici..."} »
        </p>
        
        <div className="pt-8 border-t border-stone-200">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300 mb-6">Aperçu des Besoins (Interactifs)</h4>
          <div className="flex flex-wrap justify-center gap-3">
            {profile.needs.split('\n').filter(n => n.trim()).map((need, i) => (
              <div 
                key={i} 
                className="group px-6 py-3 bg-white border border-stone-100 rounded-2xl text-sm text-stone-600 paper-shadow flex items-center gap-2"
              >
                <span className="font-serif italic">{need.replace(/^[-\s•]+/, '').trim()}</span>
                <ExternalLink className="w-3 h-3 text-stone-200 group-hover:text-blue-400 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryPreview;
