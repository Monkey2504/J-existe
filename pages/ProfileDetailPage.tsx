
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Share2, Heart, ExternalLink, 
  ShoppingBag, Navigation, Zap, Info, Sparkles, Link as LinkIcon
} from 'lucide-react';

import { obtenirProfilParIdPublic, incrementerStatistique } from '../services/mockSupabase.ts';
import { trouverSolutionsAide } from '../services/geminiService';
import { Profil } from '../types.ts';

const ProfileDetailPage: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  const [profil, setProfil] = useState<Profil | null>(null);
  const [chargement, setChargement] = useState(true);
  const [solutionsAide, setSolutionsAide] = useState<string | null>(null);
  const [sources, setSources] = useState<{title: string, uri: string}[]>([]);

  useEffect(() => {
    if (publicId) {
      obtenirProfilParIdPublic(publicId).then(async (data) => {
        if (data) {
          setProfil(data);
          incrementerStatistique(publicId, 'views');
          
          try {
            const premierBesoin = data.needs.split('\n')[0] || "Aide alimentaire";
            const res = await trouverSolutionsAide(premierBesoin, data.usual_place);
            setSolutionsAide(res.text);
            
            // Extraction des sources (Grounding Chunks)
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

  if (chargement) return <div className="min-h-screen bg-stone-950 flex items-center justify-center font-impact text-white text-5xl">GÉNÉRATION...</div>;
  if (!profil) return <div>Profil non trouvé</div>;

  return (
    <div className="min-h-screen bg-[#fdfcfb] pb-24 grainy admin-grid">
      <nav className="p-6 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-100">
        <button onClick={() => navigate('/profiles')} className="p-3 hover:bg-stone-50 rounded-full transition-colors"><ArrowLeft /></button>
        <div className="dymo-label bg-blue-600">ID PUBLIC: {profil.publicId.split('-').pop()}</div>
        <button onClick={handleShare} className="bg-stone-900 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl active:scale-95 transition-all">
          <Share2 className="w-4 h-4" /> Diffuser
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-16 space-y-16">
        <header className="flex flex-col md:flex-row gap-12 items-end">
          <div className="relative rotate-[-2deg] shadow-2xl">
             <div className="w-64 h-80 bg-white p-4 border border-stone-100">
               {profil.image_url ? (
                 <img src={profil.image_url} className="w-full h-full object-cover grayscale contrast-125" alt={profil.name} />
               ) : (
                 <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-300">PHOTO</div>
               )}
             </div>
             <div className="absolute -top-4 -right-4 bg-red-600 text-white p-4 rounded-full rotate-12 font-impact text-xl">EXISTENCE RÉELLE</div>
          </div>
          <div className="space-y-4">
            <h1 className="text-9xl font-impact text-stone-900 leading-[0.8] uppercase tracking-tighter">{profil.name}</h1>
            <div className="flex items-center gap-3 text-stone-400 font-mono text-xs uppercase">
              <MapPin className="text-blue-600 w-4 h-4" /> {profil.usual_place}
            </div>
          </div>
        </header>

        <section className="p-12 bg-white rounded-[3rem] border border-stone-100 paper-shadow space-y-8">
           <div className="flex items-center gap-3">
             <Sparkles className="w-5 h-5 text-blue-600" />
             <h2 className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">Synthèse IA</h2>
           </div>
           <p className="text-4xl font-serif italic text-stone-800 leading-tight">« {profil.reformulated_story} »</p>
        </section>

        {/* SECTION ACTION LOCALE */}
        <section className="space-y-8">
          <h3 className="font-impact text-3xl uppercase tracking-widest text-stone-900">Agir maintenant</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-600 p-10 rounded-[3rem] text-white space-y-6 shadow-2xl">
              <ShoppingBag className="w-10 h-10" />
              <h4 className="font-impact text-4xl uppercase tracking-tighter">Où aider ?</h4>
              <div className="text-blue-100 font-serif italic text-lg leading-relaxed">
                {solutionsAide || "Recherche Google en cours..."}
              </div>
              
              {/* SOURCES GROUNDING */}
              {sources.length > 0 && (
                <div className="pt-4 space-y-2">
                  <p className="text-[8px] font-black uppercase tracking-widest text-blue-300">Vérifié sur :</p>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((src, i) => (
                      <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-[8px] font-bold transition-all">
                        <LinkIcon className="w-2 h-2" /> {src.title.substring(0, 20)}...
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3">
                <Navigation className="w-5 h-5" /> Itinéraire
              </button>
            </div>

            <div className="bg-stone-900 p-10 rounded-[3rem] text-white space-y-8 shadow-2xl border border-stone-800">
              <div className="flex items-center justify-between">
                <h4 className="font-impact text-4xl uppercase tracking-tighter leading-none">Besoins <br/> Prioritaires</h4>
                <Zap className="w-8 h-8 text-amber-500 fill-amber-500" />
              </div>
              <ul className="space-y-4">
                {profil.needs.split('\n').filter(n => n.trim()).map((n, i) => (
                  <li key={i} className="flex items-start gap-4 font-mono text-[10px] uppercase border-b border-stone-800 pb-2 text-stone-400 last:border-0">
                    <Heart className="w-3 h-3 text-red-500 shrink-0" /> 
                    <span>{n.replace(/^[-\s•]+/, '').trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <footer className="text-center p-12 border-t border-stone-100">
           <p className="font-serif italic text-stone-400 text-lg">
             "Redonner un nom à un visage, c'est commencer à réparer le monde."
           </p>
        </footer>
      </main>
    </div>
  );
};

export default ProfileDetailPage;
