
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// Fixed: Added MapPin to the import list from lucide-react
import {
  ArrowLeft, Sparkles, User, Loader2,
  AlertCircle, CheckCircle2, Trash2, Zap, 
  Camera, X, ShieldAlert, History, ImageIcon,
  CreditCard, ExternalLink, MapPin
} from 'lucide-react';

import { Profil } from '../types.ts';
import { obtenirProfilParIdPublic, sauvegarderProfil } from '../services/mockSupabase.ts';
import { reformulerRecit, genererImageProfil } from '../services/geminiService';
import StoryPreview from '../components/StoryPreview';
import CameraCapture from '../components/CameraCapture';

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
    is_public: false, 
    is_archived: false, 
    is_verified: false, 
    image_url: '',
    donation_url: ''
  });
  const [besoins, setBesoins] = useState<{id: string, texte: string, urgent: boolean}[]>([]);
  const [chargement, setChargement] = useState(!!publicId && publicId !== 'new');
  const [sauvegardeEnCours, setSauvegardeEnCours] = useState(false);
  const [reformulationEnCours, setReformulationEnCours] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [cameraOuverte, setCameraOuverte] = useState(false);
  const [notif, setNotif] = useState<{msg: string, type: 'ok' | 'err'} | null>(null);

  useEffect(() => {
    if (publicId && publicId !== 'new') {
      obtenirProfilParIdPublic(publicId).then(data => {
        if (data) {
          setDonnees(data);
          if (data.needs) {
            setBesoins(data.needs.split('\n').filter(l => l.trim()).map(l => ({
              id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36),
              texte: l.replace(/^[-\s•]+/, '').trim(),
              urgent: data.urgent_needs?.includes(l.replace(/^[-\s•]+/, '').trim()) || false
            })));
          }
        }
        setChargement(false);
      });
    }
  }, [publicId]);

  const declencherIA = async () => {
    if (!donnees.raw_story || donnees.raw_story.length < 20) return;
    setReformulationEnCours(true);
    try {
      const res = await reformulerRecit(donnees.raw_story);
      setDonnees(prev => ({ ...prev, reformulated_story: res }));
      setNotif({ msg: "Synthèse factuelle générée", type: 'ok' });
    } catch (e) {
      setNotif({ msg: "Échec de l'IA", type: 'err' });
    } finally { setReformulationEnCours(false); }
  };

  const handleGenerateImage = async () => {
    if (!donnees.name) return setNotif({ msg: "Nom requis pour l'IA", type: 'err' });
    setGeneratingImage(true);
    try {
      const img = await genererImageProfil(donnees.reformulated_story || donnees.raw_story || "", donnees.name);
      if (img) {
        setDonnees(prev => ({ ...prev, image_url: img }));
        setNotif({ msg: "Portrait IA créé", type: 'ok' });
      }
    } catch (e) {
      setNotif({ msg: "Erreur image IA", type: 'err' });
    } finally { setGeneratingImage(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donnees.name) return setNotif({ msg: "Nom obligatoire", type: 'err' });
    
    setSauvegardeEnCours(true);
    try {
      const final: Profil = {
        ...donnees,
        id: donnees.id || `p_${Date.now()}`,
        publicId: donnees.publicId || `${donnees.name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`,
        created_at: donnees.created_at || new Date().toISOString(),
        needs: besoins.map(b => `- ${b.texte}`).join('\n'),
        urgent_needs: besoins.filter(b => b.urgent).map(b => b.texte),
        is_public: true
      } as Profil;
      
      await sauvegarderProfil(final);
      setNotif({ msg: "Dossier enregistré localement", type: 'ok' });
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      setNotif({ msg: "Erreur stockage", type: 'err' });
    } finally { setSauvegardeEnCours(false); }
  };

  if (chargement) return <div className="min-h-screen flex items-center justify-center bg-stone-900"><Loader2 className="w-12 h-12 animate-spin text-white" /></div>;

  return (
    <div className="min-h-screen bg-[#fdfcfb] dark:bg-stone-950 p-6 md:p-12 grainy admin-grid">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-stone-200 dark:border-stone-800 pb-8 gap-4">
          <div className="space-y-4">
            <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-[10px] font-black uppercase text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /> Annuler / Retour</button>
            <h1 className="text-5xl md:text-6xl font-impact text-stone-900 dark:text-white uppercase leading-none tracking-tight">Console de Saisie</h1>
          </div>
          <div className="dymo-label bg-blue-600">DOSSIER_REF: {donnees.publicId || 'NOUVEAU'}</div>
        </header>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <section className="bg-white dark:bg-stone-900 p-8 md:p-10 rounded-[3rem] border border-stone-100 dark:border-stone-800 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-stone-300 tracking-[0.2em]">Notes de Terrain (Brut)</label>
                <div className="flex items-center gap-2 text-[8px] font-mono text-stone-300"><History className="w-3 h-3" /> Historique Maraude</div>
              </div>
              <textarea 
                rows={10} 
                value={donnees.raw_story} 
                onChange={e => setDonnees({...donnees, raw_story: e.target.value})} 
                className="w-full bg-stone-50 dark:bg-stone-800 rounded-2xl p-6 text-sm font-mono border-none focus:ring-2 focus:ring-stone-900 dark:text-white outline-none" 
                placeholder="Décrivez la situation vécue, les mots de la personne..." 
              />
              <button 
                type="button" 
                onClick={declencherIA} 
                disabled={reformulationEnCours || !donnees.raw_story || donnees.raw_story.length < 20}
                className="w-full py-4 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30 flex items-center justify-center gap-3"
              >
                {reformulationEnCours ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Générer Synthèse Factuelle (IA)
              </button>
            </section>

            <section className="bg-white dark:bg-stone-900 p-8 md:p-10 rounded-[3rem] border border-stone-100 dark:border-stone-800 shadow-sm space-y-6">
              <label className="text-[10px] font-black uppercase text-stone-300 tracking-[0.2em]">Gestion du Portrait</label>
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="w-40 h-52 bg-stone-100 dark:bg-stone-800 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 relative shadow-inner">
                  {generatingImage ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>
                  ) : donnees.image_url ? (
                    <img src={donnees.image_url} className="w-full h-full object-cover grayscale contrast-125" alt="Portrait" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300"><ImageIcon className="w-8 h-8 opacity-20" /></div>
                  )}
                </div>
                <div className="flex-1 w-full space-y-3">
                  <button type="button" onClick={() => setCameraOuverte(true)} className="w-full py-3 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all dark:text-white"><Camera className="w-4 h-4" /> Photo Directe</button>
                  <button type="button" onClick={handleGenerateImage} disabled={generatingImage} className="w-full py-3 bg-stone-900 text-white dark:bg-white dark:text-stone-900 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-md"><Sparkles className="w-4 h-4" /> Portrait IA (Respect)</button>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-white dark:bg-stone-900 p-8 md:p-10 rounded-[3.5rem] border-2 border-blue-100 dark:border-blue-900/30 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-5 py-2 text-[8px] font-black uppercase tracking-widest">Indexation Officielle</div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-2">Identité Digitale <User className="w-3 h-3" /></label>
                  <input type="text" value={donnees.name} onChange={e => setDonnees({...donnees, name: e.target.value})} className="w-full bg-blue-50/50 dark:bg-stone-800 border-none rounded-xl px-4 py-3 font-serif text-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white" placeholder="Prénom..." />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-2">Zone de Vie <MapPin className="w-3 h-3" /></label>
                  <input type="text" value={donnees.usual_place} onChange={e => setDonnees({...donnees, usual_place: e.target.value})} className="w-full bg-blue-50/50 dark:bg-stone-800 border-none rounded-xl px-4 py-3 font-serif text-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white" placeholder="Ex: Place de la Bourse..." />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-2">URL de Soutien (Stripe/Cagnotte) <CreditCard className="w-3 h-3" /></label>
                  <div className="flex gap-2">
                    <input type="url" value={donnees.donation_url} onChange={e => setDonnees({...donnees, donation_url: e.target.value})} className="w-full bg-blue-50/50 dark:bg-stone-800 border-none rounded-xl px-4 py-3 font-mono text-xs focus:ring-2 focus:ring-blue-600 outline-none dark:text-white" placeholder="https://donate.stripe.com/..." />
                    {donnees.donation_url && <a href={donnees.donation_url} target="_blank" className="p-3 bg-stone-100 dark:bg-stone-800 rounded-xl hover:text-blue-600"><ExternalLink className="w-4 h-4" /></a>}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-blue-50 dark:border-stone-800 space-y-4">
                <label className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em]">Synthèse Consolidée par IA</label>
                <textarea 
                  rows={6} 
                  value={donnees.reformulated_story} 
                  onChange={e => setDonnees({...donnees, reformulated_story: e.target.value})} 
                  className="w-full bg-transparent p-0 text-lg font-serif italic border-none focus:ring-0 dark:text-stone-200 outline-none resize-none" 
                  placeholder="La synthèse apparaîtra ici après analyse..." 
                />
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex gap-4">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-[9px] text-amber-800 dark:text-amber-200 font-bold uppercase leading-tight">Responsabilité : Vérifiez que les informations sont factuelles et respectent la dignité de la personne.</p>
              </div>
            </section>

            <button 
              type="submit" 
              disabled={sauvegardeEnCours} 
              className="w-full py-6 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-2xl active:scale-[0.98]"
            >
              {sauvegardeEnCours ? 'INDEXATION EN COURS...' : 'VALIDER ET PUBLIER L\'EXISTENCE'}
            </button>
          </div>
        </form>
      </div>

      <AnimatePresence>
        {cameraOuverte && <CameraCapture onCapture={img => setDonnees({...donnees, image_url: img})} onClose={() => setCameraOuverte(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {notif && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 20 }} 
            className={`fixed bottom-24 md:bottom-10 right-10 z-[100] px-8 py-4 rounded-2xl flex items-center gap-4 shadow-2xl border ${notif.type === 'ok' ? 'bg-stone-900 text-white border-blue-500/50' : 'bg-red-900 text-white border-white/20'}`}
          >
            {notif.type === 'ok' ? <CheckCircle2 className="w-5 h-5 text-blue-500" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{notif.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditProfilePage;
