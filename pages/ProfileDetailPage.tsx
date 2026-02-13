
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MapPin, ExternalLink, 
  Zap, Loader2, CreditCard,
  Globe, Heart, Users, Brain, Target, Star, FileText
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import { 
  obtenirProfilParIdPublic, 
  incrementerStatistique, 
  sauvegarderProfil,
  obtenirCommentaires,
} from '../services/supabaseService.ts';
import { trouverSolutionsAide, genererImageProfil } from '../services/geminiService.ts';
import { Profil, Commentaire } from '../types.ts';

const ProfileDetailPage: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  
  const [profil, setProfil] = useState<Profil | null>(null);
  const [chargement, setChargement] = useState(true);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [solutionsAide, setSolutionsAide] = useState<string | null>(null);
  // State to store grounding sources from Google Search tool.
  const [groundingChunks, setGroundingChunks] = useState<any[]>([]);

  useEffect(() => {
    if (publicId) {
      obtenirProfilParIdPublic(publicId).then(async (data) => {
        if (data) {
          setProfil(data);
          incrementerStatistique(publicId, 'views');
          
          if (!data.image_url) {
            handleAutoGenerateImage(data);
          }

          try {
            const premierBesoin = data.needs?.split('\n')[0] || "Aide sociale";
            const res = await trouverSolutionsAide(premierBesoin, data.usual_place || "Bruxelles");
            setSolutionsAide(res.text || "Recherche terminée.");
            // Extract grounding chunks from groundingMetadata as required by the Gemini API documentation.
            const chunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            setGroundingChunks(chunks);
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
    { title: "ENTOURAGE", icon: Users, content: profil.family_circle || "Isolement constaté.", color: "text-red-600" },
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

      <main className="max-w-4xl mx-auto px-6 pt-12 space-y-24">
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
            <h1 className="text-7xl md:text-9xl font-impact text-stone-900 dark:text-white leading-none uppercase tracking-tighter">{profil.name}</h1>
            <div className="flex items-center justify-center md:justify-start gap-3 bg-stone-100 dark:bg-stone-900 p-3 rounded-xl w-fit mx-auto md:mx-0">
              <MapPin className="text-blue-600 w-4 h-4" />
              <span className="font-mono text-[9px] font-black uppercase tracking-widest text-stone-500">{profil.usual_place}</span>
            </div>
          </div>
        </header>

        {/* CONTENU LONG-FORM */}
        <div className="space-y-32">
          {sections.map((section, idx) => (
            <motion.section 
              key={section.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8 max-w-3xl"
            >
              <div className="flex items-center gap-6 border-b border-stone-100 dark:border-stone-800 pb-4">
                <section.icon className={`w-8 h-8 ${section.color}`} />
                <h2 className="font-impact text-4xl uppercase tracking-widest text-stone-900 dark:text-white">{section.title}</h2>
              </div>
              <p className="font-serif text-2xl md:text-3xl leading-[1.6] text-stone-800 dark:text-stone-300 first-letter:text-7xl first-letter:font-impact first-letter:float-left first-letter:mr-3 first-letter:text-blue-600 italic">
                {section.content}
              </p>
            </motion.section>
          ))}
        </div>

        {/* BESOINS & ACTION - GRANDE SECTION */}
        <section className="bg-stone-900 dark:bg-white p-12 md:p-20 rounded-[4rem] text-white dark:text-stone-900 shadow-2xl space-y-12 relative overflow-hidden">
          <div className="relative z-10 space-y-12">
             <div className="flex items-center gap-6">
               <Zap className="w-12 h-12 text-amber-500 fill-amber-500" />
               <h2 className="font-impact text-6xl uppercase tracking-tighter">Besoins prioritaires</h2>
             </div>
             
             <div className="grid grid-cols-1 gap-6">
                {(profil.needs || "Aucun besoin listé.").split('\n').filter(n => n.trim()).map((n, i) => (
                  <div key={i} className="flex items-start gap-6 bg-white/5 dark:bg-stone-100 p-8 rounded-3xl border border-white/10 dark:border-stone-200 transition-all hover:scale-[1.01]">
                    <div className="w-4 h-4 rounded-full bg-green-500 mt-2 shrink-0" />
                    <span className="font-impact text-2xl md:text-4xl uppercase tracking-tighter leading-tight">{n.replace(/^[-\s•]+/, '')}</span>
                  </div>
                ))}
             </div>

             {profil.donation_url ? (
               <button 
                  onClick={() => window.open(profil.donation_url, '_blank')}
                  className="w-full py-10 bg-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-[0.5em] hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-6 shadow-xl group mt-8"
                >
                  Soutenir ce parcours <CreditCard className="w-8 h-8 group-hover:rotate-12 transition-transform" />
               </button>
             ) : (
               <div className="w-full py-10 bg-stone-800 dark:bg-stone-200 text-stone-500 dark:text-stone-400 rounded-3xl font-black text-xs uppercase tracking-[0.5em] flex items-center justify-center gap-4 mt-8 cursor-not-allowed opacity-50">
                  Lien de soutien en attente <CreditCard className="w-6 h-6" />
               </div>
             )}
          </div>
        </section>

        {/* GROUNDING & IA SOLUTIONS */}
        <section className="space-y-12 pt-12 border-t border-stone-100 dark:border-stone-800">
           <div className="flex items-center gap-4">
             <Globe className="w-8 h-8 text-blue-600" />
             <h2 className="font-impact text-5xl uppercase tracking-tighter">Médiation Institutionnelle</h2>
           </div>
           <div className="bg-stone-50 dark:bg-stone-900/50 p-12 rounded-[3rem] space-y-6 shadow-inner">
             <div className="font-serif italic text-2xl text-stone-600 leading-relaxed">
               {solutionsAide || "Recherche de solutions structurelles en cours..."}
             </div>
             {/* Compliance: Extract and list source URLs from groundingChunks when Google Search is used. */}
             {groundingChunks.length > 0 && (
               <div className="pt-6 border-t border-stone-200 dark:border-stone-700">
                 <h3 className="font-impact text-sm uppercase tracking-widest text-stone-400 mb-4">Sources et ressources identifiées :</h3>
                 <div className="flex flex-wrap gap-4">
                   {groundingChunks.map((chunk, i) => {
                     const source = chunk.web || chunk.maps;
                     if (!source?.uri) return null;
                     return (
                       <a 
                         key={i}
                         href={source.uri} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-stone-800 rounded-full border border-stone-200 dark:border-stone-700 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm group"
                       >
                         {source.title || "Voir la source"} <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
                       </a>
                     );
                   })}
                 </div>
               </div>
             )}
           </div>
        </section>

        <footer className="text-center opacity-20 py-24">
           <p className="font-impact text-8xl uppercase tracking-tighter">J'EXISTE</p>
           <p className="font-mono text-xs uppercase tracking-[1em] mt-8">Document de Dignité Humaine • Index National</p>
        </footer>
      </main>
    </div>
  );
};

export default ProfileDetailPage;
