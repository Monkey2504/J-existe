
import React from 'react';
import { Profile } from '../types';
import { MapPin } from 'lucide-react';

const StoryPreview: React.FC<{ profile: Profile }> = ({ profile }) => {
  return (
    <div className="p-8 border-2 border-dashed border-stone-200 rounded-3xl bg-stone-50">
      <div className="max-w-xl mx-auto space-y-6 text-center">
        <div className="space-y-1">
          <h3 className="text-3xl font-serif font-bold text-stone-900">{profile.name || "Nom du profil"}</h3>
          <div className="flex items-center justify-center gap-1 text-stone-400 text-xs font-bold uppercase tracking-widest">
            <MapPin className="w-3 h-3" />
            {profile.usual_place || "Lieu non défini"}
          </div>
        </div>
        
        <p className="text-xl font-serif italic text-stone-700 leading-relaxed">
          « {profile.reformulated_story || "Le récit reformulé apparaîtra ici..."} »
        </p>
        
        <div className="pt-6 border-t border-stone-200">
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-300 mb-4">Besoins</h4>
          <div className="flex flex-wrap justify-center gap-2">
            {profile.needs.split('\n').filter(n => n.trim()).map((need, i) => (
              <span key={i} className="px-4 py-2 bg-white border border-stone-100 rounded-full text-sm text-stone-600">
                {need.replace('-', '').trim()}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryPreview;
