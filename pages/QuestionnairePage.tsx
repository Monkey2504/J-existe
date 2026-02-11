
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Send, Sparkles, MapPin, AlertCircle, Camera, User, Trash2 } from 'lucide-react';
import { synthesizeQuestionnaire } from '../services/geminiService.ts';
import { saveProfile } from '../services/mockSupabase.ts';
import CameraCapture from '../components/CameraCapture.tsx';

const STEPS = [
  { 
    id: 'identity', 
    title: "Comment t'appelles-tu ?", 
    subtitle: "Juste un prénom ou un surnom, c'est suffisant.",
    field: 'name',
    placeholder: "Ton prénom...",
    type: 'text'
  },
  {
    id: 'photo',
    title: "On prend un portrait ?",
    subtitle: "C'est plus facile pour te reconnaître. Tu peux refuser si tu préfères.",
    field: 'image_url',
    type: 'photo'
  },
  { 
    id: 'background', 
    title: "Tu faisais quoi avant ?", 
    subtitle: "Ton ancien métier, ta vie d'avant le bug.",
    field: 'background',
    placeholder: "Ex: J'étais ouvrier, j'avais une famille...",
    type: 'text'
  },
  { 
    id: 'trigger', 
    title: "Qu'est-ce qui a tout cassé ?", 
    subtitle: "C'était quoi le moment où ça a basculé ? Licenciement, rupture, expulsion ?",
    field: 'trigger',
    placeholder: "Raconte ce moment précis...",
    type: 'text'
  },
  { 
    id: 'daily', 
    title: "C'est quoi le plus dur ici ?", 
    subtitle: "Le froid, le bruit, l'attente, le regard des gens ?",
    field: 'dailyHardship',
    placeholder: "La réalité de tes journées...",
    type: 'text'
  },
  { 
    id: 'needs', 
    title: "De quoi as-tu besoin là ?", 
    subtitle: "Des trucs concrets pour aujourd'hui.",
    field: 'needs',
    placeholder: "Ex: Des chaussures, un duvet, un ticket de bus...",
    type: 'text'
  },
  { 
    id: 'location', 
    title: "Où est-ce qu'on peut te trouver ?", 
    subtitle: "Le quartier ou la place où tu te poses souvent.",
    field: 'location',
    placeholder: "Ex: Place Sainte-Catherine...",
    type: 'text'
  }
];

const QuestionnairePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const reformulated = await synthesizeQuestionnaire({
        background: answers.background || "",
        trigger: answers.trigger || "",
        dailyHardship: answers.dailyHardship || "",
        location: answers.location || ""
      });

      const publicId = `${answers.name?.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;
      
      await saveProfile({
        id: crypto.randomUUID(),
        publicId,
        name: answers.name || "Inconnu",
        image_url: answers.image_url || "",
        raw_story: `Avant: ${answers.background}. Basculement: ${answers.trigger}. Quotidien: ${answers.dailyHardship}`,
        reformulated_story: reformulated,
        needs: answers.needs || "",
        usual_place: answers.location || "Bruxelles",
        is_public: true,
        is_archived: false,
        is_verified: true, // Créé via questionnaire pro = vérifié par défaut
        created_at: new Date().toISOString()
      });

      navigate(`/p/${publicId}`);
    } catch (err) {
      setError("Désolé, la machine a buggé. Réessaie.");
      setIsSubmitting(false);
    }
  };

  const step = STEPS[currentStep];

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-2xl">
        
        {/* Progress bar */}
        <div className="flex gap-2 mb-20">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-blue-600' : 'bg-stone-800'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-12"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-600">Question {currentStep + 1} sur {STEPS.length}</h2>
              </div>
              <h1 className="text-5xl sm:text-7xl font-impact text-white leading-none tracking-tighter">{step.title.toUpperCase()}</h1>
              <p className="text-stone-500 font-serif italic text-xl">{step.subtitle}</p>
            </div>

            <div className="relative">
              {step.type === 'text' ? (
                <textarea
                  autoFocus
                  value={answers[step.field] || ''}
                  onChange={e => setAnswers({ ...answers, [step.field]: e.target.value })}
                  className="w-full bg-transparent border-b-2 border-stone-800 focus:border-blue-600 outline-none text-2xl sm:text-3xl text-white py-4 resize-none min-h-[100px] transition-colors"
                  placeholder={step.placeholder}
                />
              ) : (
                <div className="flex flex-col items-center gap-8 py-10">
                   <div className="w-64 h-64 rounded-[4rem] bg-stone-800 border-2 border-stone-700 overflow-hidden relative flex items-center justify-center">
                      {answers.image_url ? (
                        <img src={answers.image_url} alt="Portrait" className="w-full h-full object-cover grayscale" />
                      ) : (
                        <User className="w-20 h-20 text-stone-700" />
                      )}
                      <button 
                        onClick={() => setShowCamera(true)}
                        className="absolute inset-0 bg-stone-900/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Camera className="w-12 h-12 text-white" />
                      </button>
                   </div>
                   
                   {answers.image_url ? (
                     <button 
                        onClick={() => setAnswers({...answers, image_url: ''})}
                        className="flex items-center gap-2 text-red-500 font-bold text-[10px] uppercase tracking-widest"
                     >
                       <Trash2 className="w-4 h-4" /> Supprimer la photo
                     </button>
                   ) : (
                     <button 
                        onClick={() => setShowCamera(true)}
                        className="px-10 py-5 border-2 border-white text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-stone-900 transition-all"
                     >
                       Capturer le portrait
                     </button>
                   )}
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <div className="flex justify-between items-center pt-10">
              <button 
                onClick={() => currentStep > 0 && setCurrentStep(prev => prev - 1)}
                className={`flex items-center gap-2 text-stone-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}
              >
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>

              <button 
                onClick={handleNext}
                disabled={isSubmitting || (step.type === 'text' && !answers[step.field])}
                className="group flex items-center gap-4 bg-white px-10 py-5 rounded-full text-stone-900 font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                {isSubmitting ? 'EXISTENCE EN CRÉATION...' : (currentStep === STEPS.length - 1 ? 'PUBLIER MA FICHE' : (step.type === 'photo' && !answers.image_url ? 'PASSER CETTE ÉTAPE' : 'CONTINUER'))}
                {isSubmitting ? <Sparkles className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-12 left-12">
        <div className="flex items-center gap-3 text-stone-700">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">Bruxelles Direct Access</span>
        </div>
      </div>

      {showCamera && (
        <CameraCapture 
          onCapture={(img) => setAnswers({...answers, image_url: img})} 
          onClose={() => setShowCamera(false)} 
        />
      )}
    </div>
  );
};

export default QuestionnairePage;
