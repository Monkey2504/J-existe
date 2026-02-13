
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MapPin, ExternalLink, 
  Zap, Loader2, CreditCard,
  TrendingUp, Fingerprint, Globe, MessageSquare, Send, User, Clock,
  Heart, Users, Brain, Target, Star, FileText
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import { 
  obtenirProfilParIdPublic, 
  incrementerStatistique, 
  sauvegarderProfil,
  obtenirCommentaires,
  ajouterCommentaire
} from '../services/supabaseService.ts';
import { trouverSolutionsAide, genererImageProfil } from '../services/geminiService.ts';
import { Profil, Commentaire } from '../types.ts';

const ProfileDetailPage: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  
  const [profil, setProfil] = useState<Profil | null>(null);
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  const [nouveauComm, setNouveauComm] = useState({ auteur: '', contenu: '' });
  const [envoiComm, setEnvoiComm] = useState(false);
  
  const [chargement, setChargement] = useState(true);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [solutionsAide, setSolutionsAide] = useState<string | null>(null);
  const [sources, setSources] = useState<{title: string, uri: string}[]>([]);

  useEffect(() => {
    if (publicId) {
      obtenirProfilParIdPublic(publicId).then(async (data) => {
        if (data) {
          setProfil(data);
          incrementerStatistique(publicId, 'views');
          
          if (!data.image_url) {
            handleAutoGenerateImage(data);
          }

          const comms = await obtenirCommentaires(publicId);
          setCommentaires(comms);

          try {
            const premierBesoin = data.needs?.split('\n')[0] || "Aide sociale";
            const res = await trouverSolutionsAide(premierBesoin, data.usual_place || "Bruxelles");
            setSolutionsAide(res.text || "Recherche terminée.");
            
            const chunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (chunks) {
              const extractedSources = chunks
                .map((c: any) => c.web)
                .filter((w: any) => w && w.uri)
                .map((w: any) => ({ title: w.title || 'Solution', uri: w.uri }));
              setSources(extractedSources as any);
            }
          } catch (e) { console.error(e); }
        }
        setChargement(false);
      });
    }
  }, [publicId]);

  const handleAutoGenerateImage = async (currentProfil: Profil) => {
    setGeneratingImage(true);
    const imageUrl = await genererImageProfil(currentProfil.bio || currentProfil.raw_story || "", currentProfil.name || "Citoyen");
    if (imageUrl) {
      const updatedProfil = { ...currentProfil, image_url: imageUrl };
      setProfil(updatedProfil);
      await sauvegarderProfil(updatedProfil);
    }
    setGeneratingImage(false);
  };

  const currentUrl = window.location.href;

  if (chargement) return <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center gap-6"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /><span className="font-impact text-white text-3xl uppercase tracking-widest">INTERROGATION...</span></div>;
  if (!profil) return <div className="min-h-screen flex items-center justify-center font-impact text-3xl uppercase">Dossier introuvable</div>;

  const sections = [
    { title: "BIO", icon: FileText, content: profil.bio || profil.raw_story, color: "text-blue-600" },
    { title: "SANTÉ MENTALE", icon: Brain, content: profil.mental_health || "En cours d'évaluation.", color: "text-purple-600" },
    { title: "ENTOURAGE", icon: Users, icon2: Heart, content: profil.family_circle || "Isolement constaté.", color: "text-red-600" },
    { title: "PASSIONS", icon: Star, content: profil.passions || "À découvrir.", color: "text-amber-500" },
    { title: "PROJET", icon: Target, content: profil.projects || "Retrouver une stabilité.", color: "text-green-600" },
  ];

  return (
    <div className="min-h-screen bg-[#fdfcfb] dark:bg-stone-950 pb-40 transition-colors duration-500">
      <nav className="p-4 flex justify-between items-center bg-white/90 dark:bg-stone-900/90 backdrop-blur-md sticky top-0 z-50 border-b border-stone-200 dark:border-stone-800">
        <button onClick={() => navigate('/profiles')} className="flex items-center gap-2 p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors dark:text-white font-black text-[9px] uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Index
        </button>
        <div className="dymo-label bg-stone-900 uppercase">IDENTITÉ N° {profil.publicId.split('-').pop()}</div>
        <div className="flex items-center gap-2">
            <QRCodeSVG value={currentUrl} size={32} className="opacity-50" />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-12 space-y-16">
        {/* HEADER IDENTITÉ */}
        <header className="flex flex-col md:flex-row gap-8 items-center md:items-end">
          <div className="relative group rotate-[-1deg]">
             <div className="w-48 h-56 bg-white dark:bg-stone-800 p-3 border border-stone-200 shadow-xl">
               {generatingImage ? (
                 <div className="w-full h-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center animate-pulse"><Loader2 className="w-6 h-6 animate-spin" /></div>
               ) : (
                 <img src={profil.image_url || 'https://via.placeholder.com/300?text=JE'} className="w-full h-full object-cover grayscale contrast-125" alt={profil.name} />
               )}
             </div>
             <div className="absolute -top-3 -right-3 bg-blue-600 text-white p-2 rounded-full rotate-12 font-impact text-sm shadow-lg border border-white uppercase">Vérifié</div>
          </div>
          <div className="text-center md:text-left space-y-4">
            <h1 className="text-7xl md:text-8xl font-impact text-stone-900 dark:text-white leading-none uppercase tracking-tighter">{profil.name}</h1>
            <div className="flex items-center justify-center md:justify-start gap-3 bg-stone-100 dark:bg-stone-900 p-3 rounded-xl w-fit mx-auto md:mx-0">
              <MapPin className="text-blue-600 w-4 h-4" />
              <span className="font-mono text-[9px] font-black uppercase tracking-widest text-stone-500">{profil.usual_place}</span>
            </div>
          </div>
        </header>

        {/* BENTO GRID DES RUBRIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, idx) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 paper-shadow space-y-4 ${idx === 0 ? 'md:col-span-2' : ''}`}
            >
              <div className="flex items-center gap-3">
                <section.icon className={`w-5 h-5 ${section.color}`} />
                <h2 className="font-impact text-xl uppercase tracking-widest text-stone-400">{section.title}</h2>
              </div>
              <p className={`font-serif leading-relaxed text-stone-800 dark:text-stone-200 ${idx === 0 ? 'text-2xl italic' : 'text-lg'}`}>
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        {/* BESOINS & ACTION */}
        <section className="bg-stone-900 dark:bg-white p-10 rounded-[3rem] text-white dark:text-stone-900 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="relative z-10 space-y-6">
             <div className="flex items-center gap-4">
               <Zap className="w-8 h-8 text-amber-500 fill-amber-500" />
               <h2 className="font-impact text-4xl uppercase tracking-tighter">Index des Besoins</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(profil.needs || "Aucun besoin listé.").split('\n').filter(n => n.trim()).map((n, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 dark:bg-stone-100 p-4 rounded-2xl border border-white/10 dark:border-stone-200">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="font-impact text-xl uppercase tracking-tighter leading-none">{n.replace(/^[-\s•]+/, '')}</span>
                  </div>
                ))}
             </div>

             <button 
                onClick={() => profil.donation_url && window.open(profil.donation_url)}
                className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-blue-700 transition-all flex items-center justify-center gap-4 group mt-4"
              >
                Soutenir ce parcours <CreditCard className="w-4 h-4" />
             </button>
          </div>
          <div className="absolute -bottom-10 -right-10 text-white/5 dark:text-stone-900/5 font-impact text-[200px] rotate-[-15deg] pointer-events-none">URGENT</div>
        </section>

        {/* GROUNDING & COMMENTAIRES (Optionnel / Pied de page) */}
        <section className="space-y-12 pt-12 border-t border-stone-100 dark:border-stone-800">
           <div className="flex items-center gap-4">
             <Globe className="w-6 h-6 text-blue-600" />
             <h2 className="font-impact text-3xl uppercase tracking-tighter">Réponses Locales</h2>
           </div>
           <div className="bg-stone-50 dark:bg-stone-900/50 p-8 rounded-[2rem] font-serif italic text-stone-600">
             {solutionsAide || "Recherche de solutions..."}
           </div>
        </section>

        <footer className="text-center opacity-20 py-12">
           <p className="font-impact text-5xl uppercase tracking-tighter">J'EXISTE</p>
           <p className="font-mono text-[8px] uppercase tracking-[1em] mt-4">Document Unique de Dignité Sociale</p>
        </footer>
      </main>
    </div>
  );
};

export default ProfileDetailPage;
