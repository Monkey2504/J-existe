
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, MapPin, AlertCircle, Camera, Sparkles, Loader2, ArrowRight, ArrowLeft, CheckCircle2
} from 'lucide-react';

import { analyserProfilComplet } from '../services/geminiService.ts';
import { sauvegarderProfil } from '../services/supabaseService.ts';
import CameraCapture from '../components/CameraCapture.tsx';

const ETAPES = [
  { 
    id: 'identity', 
    title: "Comment s'appelle-t-il ?", 
    subtitle: "Juste son prénom suffit pour lui redonner une identité.", 
    field: 'name', 
    type: 'text',
    placeholder: "Ex: Jean-Pierre..." 
  },
  { 
    id: 'location', 
    title: "Où se trouve-t-il ?", 
    subtitle: "La position aidera les maraudes à le retrouver.", 
    field: 'usual_place', 
    type: 'location',
    placeholder: "Ex: Place de la Bourse..."
  },
  { 
    id: 'photo', 
    title: "Un visage sur un nom", 
    subtitle: "Une photo ou un portrait IA pour briser l'anonymat.", 
    field: 'image_url', 
    type: 'photo' 
  },
  { 
    id: 'story', 
    title: "Son récit de vie", 
    subtitle: "Racontez ce qu'il vous a confié ou ce que vous observez (besoins, parcours).", 
    field: 'raw_story', 
    type: 'text',
    placeholder: "Expliquez sa situation, son parcours..." 
  }
];

const QuestionnairePage: React.FC = () => {
  const navigate = useNavigate();
  const [etapeCourante, setEtapeCourante] = useState(0);
  const [reponses, setReponses] = useState<Record<string, string>>({});
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [cameraOuverte, setCameraOuverte] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState(false);

  const etape = ETAPES[etapeCourante];

  const detectLocation = () => {
    setLocLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        // On pourrait utiliser un geocoding ici, mais pour l'instant on stocke les coordonnées
        setReponses(prev => ({ ...prev, usual_place: `${latitude.toFixed(4)}, ${longitude.toFixed(4)} (GPS)` }));
        setLocLoading(false);
      }, (err) => {
        setErrorMsg("Géolocalisation refusée.");
        setLocLoading(false);
      });
    }
  };

  const toggleSpeech = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return setErrorMsg("Micro non supporté.");
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setReponses(prev => ({ ...prev, [etape.field]: (prev[etape.field] || '') + ' ' + text }));
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const finaliserDossier = async () => {
    if (!reponses.name || !reponses.raw_story) return setErrorMsg("Champs obligatoires manquants.");
    
    setIsAnalysing(true);
    try {
      // Comment: analyserProfilComplet returns a structured object { bio, mental_health, ... }
      const syntheseIA = await analyserProfilComplet(reponses.raw_story, reponses.image_url);
      const publicId = `${(reponses.name || "anonyme").toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;
      
      // Comment: Populate all mandatory profile fields from IA results and map bio to reformulated_story.
      await sauvegarderProfil({
        id: "",
        publicId,
        name: reponses.name,
        image_url: reponses.image_url,
        raw_story: reponses.raw_story,
        bio: syntheseIA?.bio || "",
        mental_health: syntheseIA?.mental_health || "",
        family_circle: syntheseIA?.family_circle || "",
        needs: syntheseIA?.needs || "Besoins en cours d'indexation",
        passions: syntheseIA?.passions || "",
        projects: syntheseIA?.projects || "",
        reformulated_story: syntheseIA?.bio || "Indexation en cours...",
        usual_place: reponses.usual_place || "Bruxelles",
        is_public: true,
        is_archived: false,
        is_verified: false,
        created_at: new Date().toISOString()
      });
      
      navigate(`/p/${publicId}`);
    } catch (err) {
      setErrorMsg("Erreur lors de la sauvegarde.");
      setIsAnalysing(false);
    }
  };

  if (isAnalysing) return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center space-y-12 text-center px-10">
      <div className="relative">
        <div className="w-32 h-32 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-500 animate-pulse" />
      </div>
      <div className="space-y-4">
        <h2 className="text-4xl font-impact text-white uppercase tracking-widest">IA en cours de médiation...</h2>
        <p className="font-serif italic text-stone-500 text-xl max-w-sm">Nous transformons votre rencontre en un dossier de dignité prêt pour l'action.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col">
      {/* Barre de progression */}
      <div className="h-1 bg-stone-900 w-full overflow-hidden">
        <motion.div 
          className="h-full bg-blue-600" 
          initial={{ width: 0 }} 
          animate={{ width: `${((etapeCourante + 1) / ETAPES.length) * 100}%` }} 
        />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={etape.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full space-y-12"
          >
            <div className="space-y-4">
              <span className="font-mono text-[10px] text-blue-500 uppercase tracking-widest">Étape {etapeCourante + 1} / {ETAPES.length}</span>
              <h1 className="text-5xl md:text-6xl font-impact uppercase leading-none">{etape.title}</h1>
              <p className="font-serif italic text-stone-500 text-xl">{etape.subtitle}</p>
            </div>

            <div className="relative group">
              {etape.type === 'text' && (
                <div className="space-y-6">
                  <textarea
                    autoFocus
                    value={reponses[etape.field] || ''}
                    onChange={e => setReponses({...reponses, [etape.field]: e.target.value})}
                    placeholder={etape.placeholder}
                    className="w-full bg-transparent border-b-2 border-stone-800 focus:border-blue-600 py-6 text-3xl font-serif outline-none transition-all placeholder:text-stone-800"
                    rows={etape.field === 'raw_story' ? 5 : 1}
                  />
                  <button 
                    onClick={toggleSpeech}
                    className={`flex items-center gap-3 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-stone-900 text-stone-400 hover:text-white'}`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    {isListening ? "Écoute en cours..." : "Utiliser la voix"}
                  </button>
                </div>
              )}

              {etape.type === 'location' && (
                <div className="space-y-8">
                  <input
                    type="text"
                    value={reponses[etape.field] || ''}
                    onChange={e => setReponses({...reponses, [etape.field]: e.target.value})}
                    placeholder={etape.placeholder}
                    className="w-full bg-transparent border-b-2 border-stone-800 focus:border-blue-600 py-6 text-3xl font-serif outline-none transition-all"
                  />
                  <button 
                    onClick={detectLocation}
                    className="w-full py-8 bg-stone-900 rounded-[2rem] border border-stone-800 flex flex-col items-center justify-center gap-4 hover:bg-stone-800 transition-all"
                  >
                    {locLoading ? <Loader2 className="w-8 h-8 animate-spin text-blue-500" /> : <MapPin className="w-8 h-8 text-blue-500" />}
                    <span className="font-black text-[10px] uppercase tracking-widest">Utiliser ma position actuelle</span>
                  </button>
                </div>
              )}

              {etape.type === 'photo' && (
                <div className="flex flex-col items-center gap-8">
                  <div 
                    onClick={() => setCameraOuverte(true)}
                    className="w-full aspect-square md:w-80 md:h-80 bg-stone-900 rounded-[4rem] border-2 border-dashed border-stone-800 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-blue-500 transition-all"
                  >
                    {reponses.image_url ? (
                      <img src={reponses.image_url} className="w-full h-full object-cover grayscale" alt="Aperçu" />
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-stone-600 group-hover:text-blue-500">
                        <Camera className="w-12 h-12" />
                        <span className="font-black text-[10px] uppercase tracking-widest">Prendre une photo</span>
                      </div>
                    )}
                  </div>
                  <p className="text-stone-600 font-mono text-[9px] uppercase text-center max-w-xs leading-relaxed">
                    Si la photo est impossible, l'IA générera un portrait robot digne à partir de votre récit.
                  </p>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase">
                <AlertCircle className="w-4 h-4" /> {errorMsg}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="p-8 flex justify-between items-center max-w-4xl mx-auto w-full">
        <button 
          onClick={() => etapeCourante > 0 ? setEtapeCourante(e => e - 1) : navigate('/')}
          className="flex items-center gap-2 text-stone-500 font-black text-[10px] uppercase tracking-widest hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> {etapeCourante === 0 ? "Annuler" : "Précédent"}
        </button>

        <button 
          onClick={() => etapeCourante === ETAPES.length - 1 ? finaliserDossier() : setEtapeCourante(e => e + 1)}
          className="bg-white text-stone-950 px-12 py-5 rounded-full font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-2xl active:scale-95 transition-all"
        >
          {etapeCourante === ETAPES.length - 1 ? "Générer le dossier" : "Continuer"} <ArrowRight className="w-4 h-4" />
        </button>
      </footer>

      <AnimatePresence>
        {cameraOuverte && <CameraCapture onCapture={img => setReponses({...reponses, image_url: img})} onClose={() => setCameraOuverte(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default QuestionnairePage;
