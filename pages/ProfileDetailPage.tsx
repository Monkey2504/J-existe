
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Share2, Heart, ExternalLink, 
  ShoppingBag, Navigation, Zap, Info, Sparkles, Link as LinkIcon,
  Camera, Loader2, CreditCard, ShieldCheck, CheckCircle
} from 'lucide-react';

import { obtenirProfilParIdPublic, incrementerStatistique, sauvegarderProfil } from '../services/mockSupabase.ts';
import { trouverSolutionsAide, genererImageProfil } from '../services/geminiService.ts';
import { Profil } from '../types.ts';

const ProfileDetailPage: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  const [profil, setProfil] = useState<Profil | null>(null);
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

          try {
            const premierBesoin = data.needs.split('\n')[0] || "Aide alimentaire";
            const res = await trouverSolutionsAide(premierBesoin, data.usual_place);
            setSolutionsAide(res.text);
            
            const chunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (chunks) {
              const extractedSources = chunks
                .map((c: any) => c.web)
                .filter((w: any) => w && w.uri)
                .map((w: any) => ({ title: w.title || 'Source Web', uri: w.uri }));
              setSources(extractedSources);
            }
          } catch (e) {
            console.error("Erreur grounding:", e);
          }
        }
        setChargement(false);
      });
    }
  }, [publicId]);

  const handleAutoGenerateImage = async (currentProfil: Profil) => {
    setGeneratingImage(true);
    const imageUrl = await genererImageProfil(currentProfil.reformulated_story || currentProfil.raw_story, currentProfil.name);
    if (imageUrl) {
      const updatedProfil = { ...currentProfil, image_url: imageUrl };
      setProfil(updatedProfil);
      await sauvegarderProfil(updatedProfil);
    }
    setGeneratingImage(false);
  };

  const handleShare = async () => {
    if (!profil || !navigator.share) return;
    try {
      await navigator.share({
        title: `J'EXISTE : Soutenons ${profil.name}`,
        text: `J'ai rencontré ${profil.name} à ${profil.usual_place}. Voici son histoire.`,
        url: window.location.href
      });
    } catch (e) { console.error(e); }
  };

  const handleDonationClick = () => {
    if (profil?.donation_url) {
      incrementerStatistique(profil.publicId, 'needs_clicks');
      window.open(profil.donation_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (chargement) return <div className="min-h-screen bg-stone-950 flex items-center justify-center font-impact text-white text-5xl animate-pulse uppercase">Ouverture du registre...</div>;
  if (!profil) return <div className="min-h-screen flex items-center justify-center font-impact text-3xl uppercase">Dossier introuvable</div>;

  return (
    <div className="min-h-screen bg-[#fdfcfb] dark:bg-stone-950 pb-24 grainy admin-grid transition-colors duration-500">
      <nav className="p-6 flex justify-between items-center bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-100 dark:border-stone-800">
        <button onClick={() => navigate('/profiles')} className="p-3 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-full transition-colors dark:text-white"><ArrowLeft /></button>
        <div className="dymo-label bg-blue-600">ID PUBLIC: {profil.publicId.split('-').pop()}</div>
        <button onClick={handleShare} className="bg-stone-900 dark:bg-white dark:text-stone-900 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl active:scale-95 transition-all">
          <Share2 className="w-4 h-4" /> Partager l'existence
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-16 space-y-16">
        <header className="flex flex-col md:flex-row gap-12 items-end">
          <div className="relative rotate-[-2deg] shadow-2xl">
             <div className="w-64 h-80 bg-white dark:bg-stone-800 p-4 border border-stone-100 dark:border-stone-700">
               {generatingImage ? (
                 <div className="w-full h-full bg-stone-100 dark:bg-stone-900 flex flex-col items-center justify-center gap-4 text-stone-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="font-mono text-[8px] uppercase tracking-widest text-center px-4">L'IA reconstitue un visage digne...</span>
                 </div>
               ) : profil.image_url ? (
                 <img src={profil.image_url} className="w-full h-full object-cover grayscale contrast-125" alt={profil.name} />
               ) : (
                 <div className="w-full h-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-stone-300">
                    <Camera className="w-8 h-8 opacity-20" />
                 </div>
               )}
             </div>
             <div className="absolute -top-4 -right-4 bg-red-600 text-white p-4 rounded-full rotate-12 font-impact text-xl shadow-lg">EXISTENCE RÉELLE</div>
          </div>
          <div className="space-y-4">
            <h1 className="text-9xl font-impact text-stone-900 dark:text-white leading-[0.8] uppercase tracking-tighter">{profil.name}</h1>
            <div className="flex items-center gap-3 text-stone-400 font-mono text-xs uppercase">
              <MapPin className="text-blue-600 w-4 h-4" /> {profil.usual_place}
            </div>
          </div>
        </header>

        {/* Action Majeure : Soutien Financier Stripe */}
        {profil.donation_url && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-blue-600 p-1 rounded-[3.5rem] shadow-2xl overflow-hidden relative"
          >
            <div className="absolute top-0 right-10 bg-white text-blue-600 px-6 py-2 rounded-b-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
              <CheckCircle className="w-3 h-3" /> Vérifié par J'existe
            </div>
            <button 
              onClick={handleDonationClick}
              className="w-full flex flex-col md:flex-row items-center justify-between gap-8 p-10 md:p-14 bg-stone-900 hover:bg-stone-800 transition-colors group rounded-[3.4rem]"
            >
              <div className="text-center md:text-left space-y-4">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                  <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Canal de Soutien Direct</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-impact text-white uppercase leading-none tracking-tight">Financer son <br className="hidden md:block"/> nouveau départ</h2>
                <p className="text-stone-400 font-serif italic text-xl max-w-lg leading-snug">
                  Votre contribution via Stripe est sécurisée et directement affectée aux besoins de {profil.name}.
                </p>
              </div>
              <div className="bg-white text-stone-900 px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl group-hover:scale-105 transition-transform flex items-center gap-4">
                Agir via Stripe <ArrowLeft className="w-6 h-6 rotate-180" />
              </div>
            </button>
            <div className="px-14 py-4 flex items-center justify-center md:justify-start gap-4">
               <ShieldCheck className="w-4 h-4 text-white/50" />
               <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Paiement 100% sécurisé • Traçabilité garantie par l'association référente</span>
            </div>
          </motion.div>
        )}

        <section className="p-12 bg-white dark:bg-stone-900 rounded-[3rem] border border-stone-100 dark:border-stone-800 paper-shadow space-y-8">
           <div className="flex items-center gap-3">
             <Sparkles className="w-5 h-5 text-blue-600" />
             <h2 className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">Synthèse Analytique (IA)</h2>
           </div>
           <p className="text-4xl font-serif italic text-stone-800 dark:text-stone-200 leading-tight">« {profil.reformulated_story} »</p>
        </section>

        <section className="space-y-8">
          <h3 className="font-impact text-3xl uppercase tracking-widest text-stone-900 dark:text-white">Actions locales</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-600 p-10 rounded-[3rem] text-white space-y-6 shadow-2xl">
              <ShoppingBag className="w-10 h-10" />
              <h4 className="font-impact text-4xl uppercase tracking-tighter">Logistique de Proximité</h4>
              <div className="text-blue-100 font-serif italic text-lg leading-relaxed bg-white/10 p-6 rounded-2xl">
                {solutionsAide || "Consultation des bases de données locales..."}
              </div>
              
              {sources.length > 0 && (
                <div className="pt-4 space-y-2">
                  <p className="text-[8px] font-black uppercase tracking-widest text-blue-300">Sources vérifiées :</p>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((src, i) => (
                      <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-[8px] font-bold transition-all">
                        <LinkIcon className="w-2 h-2" /> {src.title.substring(0, 20)}...
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-stone-50 transition-colors">
                <Navigation className="w-5 h-5" /> Lancer l'itinéraire
              </button>
            </div>

            <div className="bg-stone-900 p-10 rounded-[3rem] text-white space-y-8 shadow-2xl border border-stone-800">
              <div className="flex items-center justify-between">
                <h4 className="font-impact text-4xl uppercase tracking-tighter leading-none">Inventaire des <br/> Besoins</h4>
                <Zap className="w-8 h-8 text-amber-500 fill-amber-500" />
              </div>
              <ul className="space-y-4">
                {(profil.needs || "").split('\n').filter(n => n.trim()).map((n, i) => (
                  <li key={i} className="flex items-start gap-4 font-mono text-[10px] uppercase border-b border-stone-800 pb-2 text-stone-400 last:border-0">
                    <Heart className="w-3 h-3 text-red-500 shrink-0" /> 
                    <span>{n.replace(/^[-\s•]+/, '').trim()}</span>
                  </li>
                ))}
              </ul>
              <div className="p-4 bg-stone-800 rounded-2xl border border-stone-700 text-[9px] font-mono text-stone-500 uppercase tracking-widest leading-relaxed">
                Ces besoins sont identifiés sur le terrain par nos travailleurs sociaux.
              </div>
            </div>
          </div>
        </section>

        <footer className="text-center p-12 border-t border-stone-100 dark:border-stone-800">
           <p className="font-serif italic text-stone-400 text-lg">
             "Redonner un nom à un visage, c'est commencer à réparer le monde."
           </p>
           <div className="mt-8 opacity-20 hover:opacity-100 transition-opacity">
              <span className="font-mono text-[8px] uppercase tracking-[0.5em] text-stone-400">J'existe — Registre de Visibilité Sociale — 2024</span>
           </div>
        </footer>
      </main>
    </div>
  );
};

export default ProfileDetailPage;
