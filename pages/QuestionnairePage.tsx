
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Send, Sparkles, MapPin,
  AlertCircle, Camera, User, Trash2
} from 'lucide-react';

import { synthetiserQuestionnaire } from '../services/geminiService';
import { sauvegarderProfil } from '../services/mockSupabase';
import CameraCapture from '../components/CameraCapture';

// ------------------------------------------------------------
// Types et données statiques
// ------------------------------------------------------------
type TypeEtape = 'text' | 'photo';

interface Etape {
  id: string;
  title: string;
  subtitle: string;
  field: string;
  placeholder?: string;
  type: TypeEtape;
}

const ETAPES: Etape[] = [
  { id: 'identity', title: "Comment t'appelles-tu ?", subtitle: "Juste un prénom ou un surnom, c'est suffisant.", field: 'name', placeholder: 'Ton prénom...', type: 'text' },
  { id: 'photo', title: 'On prend un portrait ?', subtitle: "C'est plus facile pour te reconnaître. Tu peux refuser si tu préfères.", field: 'image_url', type: 'photo' },
  { id: 'background', title: 'Tu faisais quoi avant ?', subtitle: "Ton ancien métier, ta vie d'avant le bug.", field: 'background', placeholder: "Ex: J'étais ouvrier, j'avais une famille...", type: 'text' },
  { id: 'trigger', title: "Qu'est-ce qui a tout cassé ?", subtitle: 'C’était quoi le moment où ça a basculé ? Licenciement, rupture, expulsion ?', field: 'trigger', placeholder: 'Raconte ce moment précis...', type: 'text' },
  { id: 'daily', title: "C'est quoi le plus dur ici ?", subtitle: "Le froid, le bruit, l'attente, le regard des gens ?", field: 'dailyHardship', placeholder: "La réalité de tes journées...", type: 'text' },
  { id: 'needs', title: 'De quoi as-tu besoin là ?', subtitle: "Des trucs concrets pour aujourd'hui.", field: 'needs', placeholder: 'Ex: Des chaussures, un duvet, un ticket de bus...', type: 'text' },
  { id: 'location', title: "Où est-ce qu'on peut te trouver ?", subtitle: 'Le quartier ou la place où tu te poses souvent.', field: 'location', placeholder: 'Ex: Place Sainte-Catherine...', type: 'text' }
];

const useQuestionnaire = () => {
  const navigate = useNavigate();
  const [etapeCourante, setEtapeCourante] = useState(0);
  const [reponses, setReponses] = useState<Record<string, string>>({});
  const [soumissionEnCours, setSoumissionEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const totalEtapes = ETAPES.length;
  const etape = ETAPES[etapeCourante];

  const mettreAJourReponse = useCallback((champ: string, valeur: string) => {
    setReponses(prev => ({ ...prev, [champ]: valeur }));
  }, []);

  const estEtapeValide = useMemo(() => {
    if (etape.type === 'photo') return true; 
    const valeur = reponses[etape.field];
    return !!(valeur && valeur.trim().length > 0);
  }, [etape, reponses]);

  const allerEtapeSuivante = useCallback(() => {
    if (etapeCourante < totalEtapes - 1) {
      setEtapeCourante(prev => prev + 1);
      setErreur(null);
    }
  }, [etapeCourante, totalEtapes]);

  const allerEtapePrecedente = useCallback(() => {
    if (etapeCourante > 0) {
      setEtapeCourante(prev => prev - 1);
      setErreur(null);
    }
  }, [etapeCourante]);

  const allerAEtape = useCallback((index: number) => {
    if (index < etapeCourante) {
      setEtapeCourante(index);
      setErreur(null);
    }
  }, [etapeCourante]);

  const soumettre = useCallback(async () => {
    setSoumissionEnCours(true);
    setErreur(null);
    try {
      const recitReformule = await synthetiserQuestionnaire({
        parcours: reponses.background || '',
        declencheur: reponses.trigger || '',
        difficultes: reponses.dailyHardship || '',
        localisation: reponses.location || ''
      });

      const base = reponses.name?.toLowerCase().replace(/\s+/g, '-') || 'inconnu';
      const publicId = `${base}-${Math.random().toString(36).substring(2, 7)}`;

      await sauvegarderProfil({
        id: crypto.randomUUID(),
        publicId,
        name: reponses.name?.trim() || 'Inconnu',
        image_url: reponses.image_url || '',
        raw_story: `Récit de ${reponses.name}. Parcours : ${reponses.background}. Basculement : ${reponses.trigger}. Quotidien : ${reponses.dailyHardship}`,
        reformulated_story: recitReformule,
        needs: reponses.needs || '',
        usual_place: reponses.location?.trim() || 'Bruxelles',
        is_public: true,
        is_archived: false,
        is_verified: true,
        created_at: new Date().toISOString()
      });
      navigate(`/p/${publicId}`);
    } catch (err) {
      setErreur('Impossible de finaliser le dossier pour le moment.');
      setSoumissionEnCours(false);
    }
  }, [reponses, navigate]);

  return { etapeCourante, etape, totalEtapes, reponses, soumissionEnCours, erreur, setErreur, mettreAJourReponse, estEtapeValide, allerEtapeSuivante, allerEtapePrecedente, allerAEtape, soumettre };
};

const QuestionnairePage: React.FC = () => {
  const { etapeCourante, etape, totalEtapes, reponses, soumissionEnCours, erreur, setErreur, mettreAJourReponse, estEtapeValide, allerEtapeSuivante, allerEtapePrecedente, allerAEtape, soumettre } = useQuestionnaire();
  const [cameraOuverte, setCameraOuverte] = useState(false);

  const handleSuivant = useCallback(() => {
    if (etapeCourante === totalEtapes - 1) soumettre();
    else allerEtapeSuivante();
  }, [etapeCourante, totalEtapes, soumettre, allerEtapeSuivante]);

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-6 sm:p-12">
      <main className="w-full max-w-2xl outline-none" aria-live="polite">
        <div className="flex gap-2 mb-20">
          {Array.from({ length: totalEtapes }).map((_, i) => (
            <button key={i} onClick={() => i < etapeCourante && allerAEtape(i)} disabled={i >= etapeCourante} className={`h-1 flex-1 rounded-full transition-all ${i <= etapeCourante ? 'bg-blue-600' : 'bg-stone-800'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={etapeCourante} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-600">Question {etapeCourante + 1} / {totalEtapes}</h2>
              <h1 className="text-5xl sm:text-7xl font-impact text-white leading-none tracking-tighter uppercase">{etape.title}</h1>
              <p className="text-stone-500 font-serif italic text-xl">{etape.subtitle}</p>
            </div>

            <div className="relative">
              {etape.type === 'text' ? (
                <textarea autoFocus value={reponses[etape.field] || ''} onChange={e => mettreAJourReponse(etape.field, e.target.value)} className="w-full bg-transparent border-b-2 border-stone-800 focus:border-blue-600 outline-none text-2xl sm:text-3xl text-white py-4 resize-none min-h-[120px]" placeholder={etape.placeholder} />
              ) : (
                <div className="flex flex-col items-center gap-8 py-10">
                  <div className="w-64 h-64 rounded-[4rem] bg-stone-800 border-2 border-stone-700 overflow-hidden flex items-center justify-center group relative cursor-pointer" onClick={() => setCameraOuverte(true)}>
                    {reponses.image_url ? <img src={reponses.image_url} className="w-full h-full object-cover grayscale" /> : <User className="w-20 h-20 text-stone-700" />}
                    <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera className="w-10 h-10 text-white" /></div>
                  </div>
                  {reponses.image_url && <button onClick={() => mettreAJourReponse('image_url', '')} className="text-red-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2"><Trash2 className="w-3 h-3" /> Supprimer</button>}
                </div>
              )}
            </div>

            {erreur && <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest" role="alert"><AlertCircle className="w-4 h-4" /> {erreur}</div>}

            <div className="flex justify-between items-center pt-10">
              <button onClick={allerEtapePrecedente} disabled={etapeCourante === 0} className={`flex items-center gap-2 text-stone-500 font-black text-[10px] uppercase tracking-widest ${etapeCourante === 0 ? 'opacity-0' : 'hover:text-white'}`}><ArrowLeft className="w-4 h-4" /> Retour</button>
              <button onClick={handleSuivant} disabled={soumissionEnCours || (!estEtapeValide && etape.type !== 'photo')} className="bg-white px-10 py-5 rounded-full text-stone-900 font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30">
                {soumissionEnCours ? 'INDEXATION...' : (etapeCourante === totalEtapes - 1 ? 'PUBLIER' : 'CONTINUER')}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {cameraOuverte && <CameraCapture onCapture={img => mettreAJourReponse('image_url', img)} onClose={() => setCameraOuverte(false)} />}
    </div>
  );
};

export default React.memo(QuestionnairePage);
