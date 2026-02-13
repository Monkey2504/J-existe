
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Sparkles, User, Loader2,
  AlertCircle, CheckCircle2, Zap, 
  Camera, X, ShieldAlert, History, ImageIcon,
  CreditCard, MapPin, Plus
} from 'lucide-react';

import { Profil } from '../types.ts';
import { obtenirProfilParIdPublic, sauvegarderProfil } from '../services/supabaseService.ts';
import { reformulerRecit, genererImageProfil } from '../services/geminiService.ts';
import CameraCapture from '../components/CameraCapture.tsx';

// Comment: Component to edit or create a profile. It uses Gemini for story reformulation and image generation.
const EditProfilePage: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  
  const [donnees, setDonnees] = useState<Partial<Profil>>({
    name: '', 
    raw_story: '', 
    reformulated_story: '', 
    needs: '', 
    urgent_needs: [], 
    usual_place: '', 
    is_public: true, 
    is_archived: false, 
    is_verified: false, 
    image_url: '',
    donation_url: ''
  });
  
  const [besoins, setBesoins] = useState<{id: string, texte: string, urgent: boolean}[]>([]);
  const [nouveauBesoin, setNouveauBesoin] = useState('');
  const [chargement, setChargement] = useState(!!publicId && publicId !== 'new');
  const [sauvegardeEnCours, setSauvegardeEnCours] = useState(false);
  const [reformulationEnCours, setReformulationEnCours] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [cameraOuverte, setCameraOuverte] = useState(false);
  const [notif, setNotif] = useState<{msg: string, type: 'ok' | 'err'} | null>(null);

  // Auto-hide notifications
  useEffect(() => {
    if (notif) {
      const timer = setTimeout(() => setNotif(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notif]);

  useEffect(() => {
    if (publicId && publicId !== 'new') {
      obtenirProfilParIdPublic(publicId).then(data => {
        if (data) {
          setDonnees(data);
          if (data.needs) {
            const lines = data.needs.split('\n').filter(l => l.trim());
            setBesoins(lines.map(l => {
              const text = l.replace(/^[-\s•]+/, '').trim();
              return {
                id: Math.random().toString(36).substring(2, 9),
                texte: text,
                urgent: data.urgent_needs?.includes(text) || false
              };
            }));
          }
        }
        setChargement(false);
      });
    }
  }, [publicId]);

  const ajouterBesoin = () => {
    if (!nouveauBesoin.trim()) return;
    setBesoins(prev => [...prev, { 
      id: Math.random().toString(36).substring(2, 9), 
      texte: nouveauBesoin.trim(), 
      urgent: false 
    }]);
    setNouveauBesoin('');
  };

  const supprimerBesoin = (id: string) => {
    setBesoins(prev => prev.filter(b => b.id !== id));
  };

  const toggleUrgence = (id: string) => {
    setBesoins(prev => prev.map(b => b.id === id ? { ...b, urgent: !b.urgent } : b));
  };

  const declencherIA = async () => {
    if (!donnees.raw_story || donnees.raw_story.length < 20) {
      setNotif({ msg: "Récit trop court pour analyse", type: 'err' });
      return;
    }
    setReformulationEnCours(true);
    try {
      const res = await reformulerRecit(donnees.raw_story);
      setDonnees(prev => ({ ...prev, reformulated_story: res }));
      setNotif({ msg: "Analyse terminée avec succès", type: 'ok' });
    } catch (e) {
      setNotif({ msg: "Échec de l'IA", type: 'err' });
    } finally { setReformulationEnCours(false); }
  };

  const handleGenerateImage = async () => {
    if (!donnees.name) return setNotif({ msg: "Prénom requis pour le prompt", type: 'err' });
    setGeneratingImage(true);
    try {
      const promptSource = donnees.reformulated_story || donnees.raw_story || "";
      const img = await genererImageProfil(promptSource, donnees.name);
      if (img) {
        setDonnees(prev => ({ ...prev, image_url: img }));
        setNotif({ msg: "Portrait IA généré", type: 'ok' });
      }
    } catch (e) {
      setNotif({ msg: "Erreur lors de la génération", type: 'err' });
    } finally { setGeneratingImage(false); }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!donnees.name) return setNotif({ msg: "Nom obligatoire", type: 'err' });
    
    setSauvegardeEnCours(true);
    try {
      const final: Profil = {
        ...donnees,
        id: donnees.id || `p_${Date.now()}`,
        publicId: donnees.publicId || `${donnees.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`,
        created_at: donnees.created_at || new Date().toISOString(),
        needs: besoins.map(b => `- ${b.texte}`).join('\n'),
        urgent_needs: besoins.filter(b => b.urgent).map(b => b.texte),
        is_public: true
      } as Profil;
      
      await sauvegarderProfil(final);
      setNotif({ msg: "Profil enregistré dans le registre", type: 'ok' });
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      setNotif({ msg: "Erreur lors de la sauvegarde", type: 'err' });
    } finally { setSauvegardeEnCours(false); }
  };

  if (chargement) return <div className="min-h-screen flex items-center justify-center bg-stone-900 text-white font-impact text-3xl tracking-widest animate-pulse">CHARGEMENT DU DOSSIER...</div>;

  // Comment: Return the JSX for the edit/create profile page.
  return (
    <div className="min-h-screen bg-[#f8f7f4] dark:bg-stone-950 pb-40">
      <main className="max-w-4xl mx-auto px-6 pt-32 space-y-12">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-12 gap-8">
          <div className="space-y-4">
            <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4" /> Retour Administration
            </button>
            <h1 className="text-6xl font-impact text-stone-900 dark:text-white uppercase tracking-tighter leading-none">
              {publicId === 'new' ? 'Nouveau Dossier' : 'Modification Dossier'}
            </h1>
          </div>
          <button 
            onClick={() => handleSave()} 
            disabled={sauvegardeEnCours}
            className="px-10 py-5 bg-blue-600 text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-3"
          >
            {sauvegardeEnCours ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
            Enregistrer le Dossier
          </button>
        </header>

        <form onSubmit={handleSave} className="space-y-12">
          {/* Section Identité */}
          <section className="bg-white dark:bg-stone-900 p-12 rounded-[3rem] paper-shadow border border-stone-100 dark:border-stone-800 space-y-10">
            <div className="flex items-center gap-4 border-b border-stone-50 dark:border-stone-800 pb-6">
              <User className="w-6 h-6 text-blue-600" />
              <h2 className="font-impact text-3xl uppercase tracking-tighter">Identité de Base</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="font-mono text-[10px] uppercase tracking-widest text-stone-400">Prénom du Citoyen</label>
                <input 
                  type="text" 
                  value={donnees.name} 
                  onChange={e => setDonnees({...donnees, name: e.target.value})}
                  className="w-full bg-stone-50 dark:bg-stone-800 p-6 rounded-2xl border border-stone-100 dark:border-stone-700 outline-none focus:border-blue-500 transition-colors font-serif text-xl italic"
                  placeholder="Ex: Jean-Pierre"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="font-mono text-[10px] uppercase tracking-widest text-stone-400">Zone d'existence habituelle</label>
                <div className="relative">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 w-5 h-5" />
                  <input 
                    type="text" 
                    value={donnees.usual_place} 
                    onChange={e => setDonnees({...donnees, usual_place: e.target.value})}
                    className="w-full bg-stone-50 dark:bg-stone-800 pl-16 pr-6 py-6 rounded-2xl border border-stone-100 dark:border-stone-700 outline-none focus:border-blue-500 transition-colors font-serif text-xl italic"
                    placeholder="Ex: Place de la Bourse, Bruxelles"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="font-mono text-[10px] uppercase tracking-widest text-stone-400">Lien de soutien (Stripe/Cagnotte)</label>
              <div className="relative">
                <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 w-5 h-5" />
                <input 
                  type="url" 
                  value={donnees.donation_url} 
                  onChange={e => setDonnees({...donnees, donation_url: e.target.value})}
                  className="w-full bg-stone-50 dark:bg-stone-800 pl-16 pr-6 py-6 rounded-2xl border border-stone-100 dark:border-stone-700 outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                  placeholder="https://buy.stripe.com/..."
                />
              </div>
            </div>
          </section>

          {/* Section Récit */}
          <section className="bg-white dark:bg-stone-900 p-12 rounded-[3rem] paper-shadow border border-stone-100 dark:border-stone-800 space-y-10">
            <div className="flex items-center justify-between border-b border-stone-50 dark:border-stone-800 pb-6">
              <div className="flex items-center gap-4">
                <History className="w-6 h-6 text-blue-600" />
                <h2 className="font-impact text-3xl uppercase tracking-tighter">Trajectoire de Vie</h2>
              </div>
              <button 
                type="button"
                onClick={declencherIA}
                disabled={reformulationEnCours}
                className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50 shadow-lg"
              >
                {reformulationEnCours ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                Rédiger par IA
              </button>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="font-mono text-[10px] uppercase tracking-widest text-stone-400">Notes de terrain (Brutes)</label>
                <textarea 
                  value={donnees.raw_story} 
                  onChange={e => setDonnees({...donnees, raw_story: e.target.value})}
                  className="w-full bg-stone-50 dark:bg-stone-800 p-8 rounded-3xl border border-stone-100 dark:border-stone-700 outline-none focus:border-blue-500 transition-colors font-serif text-lg leading-relaxed min-h-[150px]"
                  placeholder="Saisissez ici les éléments marquants du parcours..."
                />
              </div>

              <div className="space-y-3">
                <label className="font-mono text-[10px] uppercase tracking-widest text-stone-400">Version Publique (Reformulée)</label>
                <textarea 
                  value={donnees.reformulated_story} 
                  onChange={e => setDonnees({...donnees, reformulated_story: e.target.value})}
                  className="w-full bg-blue-50/30 dark:bg-blue-900/10 p-8 rounded-3xl border border-blue-100 dark:border-blue-900/20 outline-none focus:border-blue-500 transition-colors font-serif italic text-xl leading-relaxed text-blue-900 dark:text-blue-100 min-h-[250px]"
                  placeholder="Le texte généré par l'IA s'affichera ici..."
                />
              </div>
            </div>
          </section>

          {/* Section Besoins */}
          <section className="bg-white dark:bg-stone-900 p-12 rounded-[3rem] paper-shadow border border-stone-100 dark:border-stone-800 space-y-10">
            <div className="flex items-center justify-between border-b border-stone-50 dark:border-stone-800 pb-6">
              <div className="flex items-center gap-4">
                <Zap className="w-6 h-6 text-amber-500" />
                <h2 className="font-impact text-3xl uppercase tracking-tighter">Index des Besoins</h2>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex gap-4">
                <input 
                  type="text" 
                  value={nouveauBesoin}
                  onChange={e => setNouveauBesoin(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), ajouterBesoin())}
                  className="flex-1 bg-stone-50 dark:bg-stone-800 px-8 py-5 rounded-2xl border border-stone-100 dark:border-stone-700 outline-none focus:border-blue-500 transition-colors font-serif text-lg italic"
                  placeholder="Ajouter un besoin spécifique..."
                />
                <button 
                  type="button"
                  onClick={ajouterBesoin}
                  className="px-8 bg-stone-900 text-white rounded-2xl hover:bg-stone-800 transition-colors"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {besoins.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-6 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-100 dark:border-stone-700 group">
                    <div className="flex items-center gap-6">
                      <button 
                        type="button"
                        onClick={() => toggleUrgence(b.id)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${b.urgent ? 'bg-amber-500 text-white shadow-lg' : 'bg-white dark:bg-stone-900 text-stone-200 hover:text-amber-500'}`}
                        title="Marquer comme urgent"
                      >
                        <Zap className={`w-5 h-5 ${b.urgent ? 'fill-current' : ''}`} />
                      </button>
                      <span className={`font-impact text-2xl uppercase tracking-tighter ${b.urgent ? 'text-amber-600' : 'text-stone-700 dark:text-stone-200'}`}>
                        {b.texte}
                      </span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => supprimerBesoin(b.id)}
                      className="p-3 text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section Visuel */}
          <section className="bg-white dark:bg-stone-900 p-12 rounded-[3rem] paper-shadow border border-stone-100 dark:border-stone-800 space-y-10">
            <div className="flex items-center justify-between border-b border-stone-50 dark:border-stone-800 pb-6">
              <div className="flex items-center gap-4">
                <ImageIcon className="w-6 h-6 text-blue-600" />
                <h2 className="font-impact text-3xl uppercase tracking-tighter">Documentation Visuelle</h2>
              </div>
              <button 
                type="button"
                onClick={handleGenerateImage}
                disabled={generatingImage}
                className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50 shadow-lg"
              >
                {generatingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                Portrait IA
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div 
                onClick={() => setCameraOuverte(true)}
                className="w-64 h-64 bg-stone-100 dark:bg-stone-800 rounded-[3rem] border-2 border-dashed border-stone-200 dark:border-stone-700 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50/10 transition-all overflow-hidden"
              >
                {donnees.image_url ? (
                  <img src={donnees.image_url} alt="Aperçu" className="w-full h-full object-cover grayscale" />
                ) : (
                  <>
                    <Camera className="w-10 h-10 text-stone-300" />
                    <span className="font-mono text-[8px] uppercase tracking-widest text-stone-400">Prendre une photo</span>
                  </>
                )}
              </div>
              <p className="flex-1 font-serif italic text-stone-500 text-lg leading-relaxed">
                Utilisez la caméra pour un portrait terrain ou laissez l'IA générer une représentation digne du citoyen à partir de sa trajectoire de vie. La photo est un rempart contre l'anonymat.
              </p>
            </div>
          </section>
        </form>

        <footer className="text-center py-20 opacity-20 border-t border-stone-100 dark:border-stone-800">
           <p className="font-impact text-5xl text-stone-900 dark:text-white uppercase tracking-tighter">J'EXISTE</p>
           <p className="font-mono text-[8px] uppercase tracking-[1em] mt-4">Système d'Indexation de Dignité</p>
        </footer>
      </main>

      {/* Notifications */}
      <AnimatePresence>
        {notif && (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className={`fixed bottom-10 right-10 z-[100] px-8 py-5 rounded-[2rem] flex items-center gap-4 shadow-2xl bg-stone-900 text-white border border-white/10`}>
            {notif.type === 'ok' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{notif.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cameraOuverte && (
          <CameraCapture 
            onCapture={(img) => setDonnees({...donnees, image_url: img})} 
            onClose={() => setCameraOuverte(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Comment: Add default export to fix the error in App.tsx line 14 where lazy loading expects a default export.
export default EditProfilePage;
