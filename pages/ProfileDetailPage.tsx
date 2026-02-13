
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MapPin, ExternalLink, 
  Zap, Link as LinkIcon,
  Loader2, CreditCard, CheckCircle, History,
  TrendingUp, Fingerprint, Globe, MessageSquare, Send, User, Clock
} from 'lucide-react';

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
      // Charger le profil
      obtenirProfilParIdPublic(publicId).then(async (data) => {
        if (data) {
          setProfil(data);
          incrementerStatistique(publicId, 'views');
          
          if (!data.image_url) {
            handleAutoGenerateImage(data);
          }

          // Charger les commentaires
          const comms = await obtenirCommentaires(publicId);
          setCommentaires(comms);

          // Grounding Google Search
          try {
            const premierBesoin = data.needs?.split('\n')[0] || "Aide alimentaire";
            const res = await trouverSolutionsAide(premierBesoin, data.usual_place || "Bruxelles");
            setSolutionsAide(res.text || "Recherche terminée.");
            
            const chunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (chunks) {
              const extractedSources = chunks
                .map((c: any) => c.web)
                .filter((w: any) => w && w.uri)
                .map((w: any) => ({ 
                  title: w.title || 'Solution identifiée', 
                  uri: w.uri 
                }));
              const uniqueSources = Array.from(new Map(extractedSources.map((s: any) => [s.uri, s])).values());
              setSources(uniqueSources as any);
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
    const imageUrl = await genererImageProfil(currentProfil.reformulated_story || currentProfil.raw_story || "", currentProfil.name || "Citoyen");
    if (imageUrl) {
      const updatedProfil = { ...currentProfil, image_url: imageUrl };
      setProfil(updatedProfil);
      await sauvegarderProfil(updatedProfil);
    }
    setGeneratingImage(false);
  };

  const handleDonationClick = () => {
    if (profil?.donation_url) {
      incrementerStatistique(profil.publicId, 'needs_clicks');
      window.open(profil.donation_url, '_blank', 'noopener,noreferrer');
    }
  };

  const soumettreCommentaire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauComm.auteur || !nouveauComm.contenu || !publicId) return;
    
    setEnvoiComm(true);
    try {
      const res = await ajouterCommentaire(publicId, nouveauComm.auteur, nouveauComm.contenu);
      if (res) {
        setCommentaires(prev => [...prev, res]);
        setNouveauComm({ auteur: '', contenu: '' });
      }
    } catch (err) {
      console.error("Erreur envoi commentaire:", err);
    } finally {
      setEnvoiComm(false);
    }
  };

  const getHostname = (uri: string) => {
    try {
      return new URL(uri).hostname;
    } catch {
      return "Source externe";
    }
  };

  if (chargement) return <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center gap-6"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /><span className="font-impact text-white text-3xl uppercase tracking-widest text-center">Interrogation du registre...</span></div>;
  if (!profil) return <div className="min-h-screen flex items-center justify-center font-impact text-3xl uppercase">Dossier introuvable</div>;

  return (
    <div className="min-h-screen bg-[#fdfcfb] dark:bg-stone-950 pb-40 grainy transition-colors duration-500">
      <nav className="p-6 flex justify-between items-center bg-white/90 dark:bg-stone-900/90 backdrop-blur-md sticky top-0 z-50 border-b border-stone-200 dark:border-stone-800">
        <button onClick={() => navigate('/profiles')} className="flex items-center gap-3 p-3 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-full transition-colors dark:text-white font-black text-[10px] uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Retour à l'Index
        </button>
        <div className="dymo-label bg-blue-600 hidden sm:block uppercase">DOSSIER_ID: {profil?.publicId?.split('-').pop() || "REF"}</div>
        <button onClick={() => window.print()} className="bg-stone-900 dark:bg-white dark:text-stone-900 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl active:scale-95 transition-all">
          <LinkIcon className="w-4 h-4" /> Exporter Dossier
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-16 space-y-24">
        {/* Header Portfolio */}
        <header className="flex flex-col md:flex-row gap-16 items-end">
          <div className="relative group rotate-[-2deg]">
             <div className="w-72 h-80 bg-white dark:bg-stone-800 p-4 border border-stone-200 dark:border-stone-700 shadow-2xl transition-transform group-hover:rotate-0">
               {generatingImage ? (
                 <div className="w-full h-full bg-stone-100 dark:bg-stone-900 flex flex-col items-center justify-center gap-4 text-stone-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="font-mono text-[8px] uppercase tracking-widest text-center px-4">Analyse des traits...</span>
                 </div>
               ) : profil?.image_url ? (
                 <img src={profil.image_url} className="w-full h-full object-cover grayscale contrast-125" alt={profil.name} />
               ) : (
                 <div className="w-full h-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-stone-300">
                    <Fingerprint className="w-12 h-12 opacity-20" />
                 </div>
               )}
             </div>
             <div className="absolute -top-4 -right-4 bg-blue-600 text-white p-4 rounded-full rotate-12 font-impact text-xl shadow-lg border-2 border-white uppercase">Citoyen Indexé</div>
          </div>
          <div className="space-y-6 flex-1">
            <h1 className="text-[12vw] md:text-[9vw] font-impact text-stone-900 dark:text-white leading-[0.7] uppercase tracking-tighter">{profil?.name || "Citoyen"}</h1>
            <div className="flex items-center gap-4 bg-stone-100 dark:bg-stone-900 p-4 rounded-2xl w-fit">
              <MapPin className="text-blue-600 w-5 h-5" />
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-stone-500">Localisation habituelle : {profil?.usual_place || "Bruxelles"}</span>
            </div>
          </div>
        </header>

        {/* Corps du Dossier */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7 space-y-12">
             <div className="bg-white dark:bg-stone-900 p-12 rounded-[4rem] border border-stone-100 dark:border-stone-800 paper-shadow space-y-12">
                <div className="flex items-center justify-between border-b border-stone-50 dark:border-stone-800 pb-8">
                  <div className="flex items-center gap-4">
                    <History className="w-6 h-6 text-blue-600" />
                    <h2 className="font-impact text-4xl uppercase tracking-tighter">Trajectoire de Vie</h2>
                  </div>
                </div>
                
                <div className="space-y-10">
                  <p className="text-2xl md:text-3xl font-serif italic text-stone-800 dark:text-stone-200 leading-relaxed">
                    {profil?.reformulated_story || profil?.raw_story || "Aucun récit documenté."}
                  </p>
                  
                  <div className="p-10 bg-blue-50/50 dark:bg-blue-900/10 rounded-[3rem] border border-blue-100 dark:border-blue-900/20 space-y-6">
                    <div className="flex items-center gap-3 text-blue-700 dark:text-blue-300">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-black text-[10px] uppercase tracking-[0.4em]">Analyse du Rebond</span>
                    </div>
                    <p className="font-serif italic text-lg leading-relaxed text-blue-900/80 dark:text-blue-200/80">
                      Ce profil présente une rupture administrative et physique majeure. La réactivation passe par le rétablissement de sa dignité immédiate et la fourniture de matériel technique adapté à sa situation de précarité.
                    </p>
                  </div>
                </div>
             </div>
          </div>

          <aside className="lg:col-span-5 space-y-10">
            <div className="bg-stone-900 dark:bg-white p-12 rounded-[4rem] text-white dark:text-stone-900 shadow-2xl flex flex-col justify-between h-full min-h-[600px] relative overflow-hidden">
              <div className="space-y-10 relative z-10">
                <div className="flex justify-between items-start">
                  <CreditCard className="w-12 h-12 text-blue-500" />
                  <Zap className="w-8 h-8 text-amber-500 fill-amber-500 animate-pulse" />
                </div>
                <h3 className="font-impact text-6xl uppercase leading-none tracking-tighter">INDEX DES <br/> BESOINS</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    {(profil?.needs || "").split('\n').filter(n => n.trim()).map((n, i) => (
                      <div key={i} className="flex items-start gap-4 bg-white/5 dark:bg-stone-50 p-5 rounded-3xl border border-white/10 dark:border-stone-200">
                        <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                        <span className="font-impact text-2xl uppercase tracking-tighter leading-none">{n.replace(/^[-\s•]+/, '')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-12 relative z-10">
                <button 
                  onClick={handleDonationClick}
                  className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-4 group"
                >
                  Soutenir le citoyen <ExternalLink className="w-5 h-5" />
                </button>
              </div>
              <div className="absolute -bottom-20 -right-20 text-white/5 dark:text-stone-900/5 font-impact text-[280px] rotate-[-15deg] pointer-events-none">VITAL</div>
            </div>
          </aside>
        </section>

        {/* Section Grounding / Solutions */}
        <section className="bg-white dark:bg-stone-900 p-12 rounded-[4rem] border border-stone-100 dark:border-stone-800 space-y-12">
          <header className="space-y-4">
            <div className="flex items-center gap-4">
              <Globe className="w-6 h-6 text-blue-600" />
              <h2 className="font-impact text-4xl uppercase tracking-tighter">Services de Proximité</h2>
            </div>
            <p className="font-serif italic text-stone-500 text-xl">Infrastructures identifiées pour répondre aux besoins spécifiques dans la zone de {profil?.usual_place || "Bruxelles"}.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-stone-50 dark:bg-stone-800/50 p-10 rounded-[3rem] border border-stone-100 dark:border-stone-800">
              <p className="font-serif italic text-lg leading-relaxed text-stone-700 dark:text-stone-300">
                {solutionsAide || "Chargement des solutions de terrain via Google Grounding..."}
              </p>
            </div>
            <div className="space-y-4">
                {sources.map((s, i) => (
                  <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-6 bg-white dark:bg-stone-800 rounded-3xl border border-stone-100 dark:border-stone-800 hover:border-blue-500 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-stone-50 dark:bg-stone-900 rounded-2xl flex items-center justify-center text-stone-400 group-hover:text-blue-600 transition-all"><LinkIcon className="w-5 h-5" /></div>
                      <div>
                        <span className="font-serif font-bold text-stone-900 dark:text-white block">{s.title.substring(0, 45)}...</span>
                        <span className="font-mono text-[8px] text-stone-400 uppercase tracking-widest">{getHostname(s.uri)}</span>
                      </div>
                    </div>
                  </a>
                ))}
            </div>
          </div>
        </section>

        {/* ADDENDUM : SECTION COMMENTAIRES / TÉMOIGNAGES */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <h2 className="font-impact text-5xl uppercase tracking-tighter">Addendum : Notes de Solidarité</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Formulaire de déposition */}
            <div className="lg:col-span-5">
              <form onSubmit={soumettreCommentaire} className="bg-white dark:bg-stone-900 p-10 rounded-[3rem] border border-stone-100 dark:border-stone-800 paper-shadow space-y-8 sticky top-32">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-stone-400">Identité du déposant</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-4 h-4" />
                    <input 
                      type="text" 
                      required
                      value={nouveauComm.auteur}
                      onChange={e => setNouveauComm({...nouveauComm, auteur: e.target.value})}
                      className="w-full bg-stone-50 dark:bg-stone-800 pl-12 pr-4 py-4 rounded-2xl border border-stone-100 dark:border-stone-700 outline-none focus:border-blue-500 font-serif italic transition-all"
                      placeholder="Votre nom ou pseudonyme..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-stone-400">Témoignage / Message de soutien</label>
                  <textarea 
                    required
                    rows={5}
                    value={nouveauComm.contenu}
                    onChange={e => setNouveauComm({...nouveauComm, contenu: e.target.value})}
                    className="w-full bg-stone-50 dark:bg-stone-800 p-6 rounded-3xl border border-stone-100 dark:border-stone-700 outline-none focus:border-blue-500 font-serif italic transition-all resize-none"
                    placeholder="Partagez une rencontre, un message d'espoir ou une information utile..."
                  />
                </div>

                <button 
                  type="submit"
                  disabled={envoiComm}
                  className="w-full py-5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-full font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-xl disabled:opacity-50"
                >
                  {envoiComm ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                  Ajouter au dossier public
                </button>
                <p className="font-mono text-[8px] text-stone-400 text-center uppercase tracking-widest">Chaque message renforce la visibilité du citoyen.</p>
              </form>
            </div>

            {/* Flux de témoignages */}
            <div className="lg:col-span-7 space-y-8">
              <AnimatePresence mode="popLayout">
                {commentaires.length === 0 ? (
                  <div className="py-20 text-center space-y-4 bg-stone-50/50 dark:bg-stone-900/50 rounded-[3rem] border border-dashed border-stone-200 dark:border-stone-800">
                    <MessageSquare className="w-12 h-12 text-stone-200 mx-auto" />
                    <p className="font-serif italic text-stone-400 text-xl">Aucun addendum pour l'instant. <br/> Soyez le premier à témoigner.</p>
                  </div>
                ) : (
                  commentaires.map((comm) => (
                    <motion.article 
                      key={comm.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-stone-900 p-8 md:p-10 rounded-[3rem] border border-stone-100 dark:border-stone-800 paper-shadow space-y-6 relative group"
                    >
                      <div className="flex items-center justify-between border-b border-stone-50 dark:border-stone-800 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="font-impact text-xl uppercase tracking-tight text-stone-900 dark:text-white">{comm.author_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-stone-300 font-mono text-[9px] uppercase tracking-widest">
                          <Clock className="w-3 h-3" />
                          {new Date(comm.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <p className="font-serif italic text-lg leading-relaxed text-stone-700 dark:text-stone-300">
                        « {comm.content} »
                      </p>
                      <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-10 transition-opacity">
                         <MessageSquare className="w-12 h-12" />
                      </div>
                    </motion.article>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        <footer className="text-center py-20 opacity-20 border-t border-stone-100 dark:border-stone-800">
           <p className="font-impact text-7xl text-stone-900 dark:text-white uppercase tracking-tighter">J'EXISTE</p>
           <p className="font-mono text-[9px] uppercase tracking-[1em] mt-6">Protocole de Visibilité Humaine • Bruxelles 2024</p>
        </footer>
      </main>
    </div>
  );
};

export default ProfileDetailPage;
