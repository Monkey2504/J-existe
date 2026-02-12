
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Mic, MicOff, MapPin,
  AlertCircle, Camera, User, Sparkles, Loader2
} from 'lucide-react';

import { analyserProfilComplet } from '../services/geminiService';
import { sauvegarderProfil } from '../services/mockSupabase';
import CameraCapture from '../components/CameraCapture';

const ETAPES = [
  { id: 'identity', title: "Son Prénom", subtitle: "Comment s'appelle cette personne ?", field: 'name', type: 'text' },
  { id: 'photo', title: 'Le Regard', subtitle: "Prenez une photo (avec son accord) pour l'index.", field: 'image_url', type: 'photo' },
  { id: 'story', title: 'Son Récit', subtitle: "Utilisez le micro. Racontez son histoire et ce qu'il lui manque.", field: 'raw_story', type: 'text' }
];

const QuestionnairePage: React.FC = () => {
  const navigate = useNavigate();
  const [etapeCourante, setEtapeCourante] = useState(0);
  const [reponses, setReponses] = useState<Record<string, string>>({});
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [cameraOuverte, setCameraOuverte] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const etape = ETAPES[etapeCourante];

  const toggleSpeech = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setReponses(prev => ({ ...prev, [etape.field]: (prev[etape.field] || '') + ' ' + text }));
      setIsListening(false);
    };
    recognition.start();
  };

  const finaliserDossier = async () => {
    setIsAnalysing(true);
    try {
      const syntheseIA = await analyserProfilComplet(reponses.raw_story, reponses.image_url);
      
      const publicId = `${reponses.name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;
      
      await sauvegarderProfil({
        id: crypto.randomUUID(),
        publicId,
        name: reponses.name,
        image_url: reponses.image_url,
        raw_story: reponses.raw_story,
        reformulated_story: syntheseIA,
        needs: "Chargement des solutions locales...",
        usual_place: "Localisation GPS partagée",
        is_public: true,
        is_archived: false,
        is_verified: true,
        created_at: new Date().toISOString()
      });
      
      navigate(`/p/${publicId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalysing(false);
    }
  };

  if (isAnalysing) return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center space-y-8 text-center px-10">
      <div className="relative">
        <Loader2 className="w-20 h-20 text-blue-600 animate-spin" />
        <Sparkles className="absolute top-0 right-0 w-8 h-8 text-white animate-pulse" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-impact text-white uppercase tracking-widest">L'IA témoigne...</h2>
        <p className="font-serif italic text-stone-500">Analyse de la photo et du récit pour ne rien oublier.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-12">
        <header className="space-y-4">
           <h1 className="text-4xl font-impact text-white uppercase tracking-tighter">{etape.title}</h1>
           <p className="text-stone-500 font-serif italic">{etape.subtitle}</p>
        </header>

        <main className="min-h-[300px] flex items-center justify-center">
          {etape.type === 'text' ? (
            <div className="w-full relative">
              <textarea 
                value={reponses[etape.field] || ''}
                onChange={e => setReponses({...reponses, [etape.field]: e.target.value})}
                className="w-full bg-transparent border-b-2 border-stone-800 text-white text-3xl font-serif py-4 focus:border-blue-600 outline-none"
                placeholder="..."
              />
              <button onClick={toggleSpeech} className={`absolute right-0 bottom-4 p-4 rounded-full ${isListening ? 'bg-red-600 animate-pulse' : 'bg-stone-800'}`}>
                {isListening ? <MicOff className="text-white" /> : <Mic className="text-white" />}
              </button>
            </div>
          ) : (
            <div onClick={() => setCameraOuverte(true)} className="w-64 h-64 bg-stone-900 rounded-[3rem] border-2 border-dashed border-stone-700 flex items-center justify-center cursor-pointer overflow-hidden">
              {reponses.image_url ? <img src={reponses.image_url} className="w-full h-full object-cover grayscale" /> : <Camera className="w-12 h-12 text-stone-700" />}
            </div>
          )}
        </main>

        <footer className="flex justify-between">
          <button onClick={() => setEtapeCourante(e => e - 1)} disabled={etapeCourante === 0} className="text-stone-500 uppercase font-black text-[10px] tracking-widest">Retour</button>
          <button 
            onClick={() => etapeCourante === ETAPES.length - 1 ? finaliserDossier() : setEtapeCourante(e => e + 1)} 
            className="bg-white px-10 py-4 rounded-full text-stone-950 font-black text-[10px] uppercase tracking-widest"
          >
            {etapeCourante === ETAPES.length - 1 ? 'PUBLIER L\'EXISTENCE' : 'SUIVANT'}
          </button>
        </footer>
      </div>
      {cameraOuverte && <CameraCapture onCapture={img => setReponses({...reponses, image_url: img})} onClose={() => setCameraOuverte(false)} />}
    </div>
  );
};

export default QuestionnairePage;
