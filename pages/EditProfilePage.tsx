
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Sparkles, User, Loader2,
  AlertCircle, CheckCircle2, Trash2, Zap, 
  Camera, X, ShieldAlert, History
} from 'lucide-react';

import { Profil } from '../types.ts';
import { obtenirProfilParIdPublic, sauvegarderProfil } from '../services/mockSupabase.ts';
import { reformulerRecit } from '../services/geminiService';
import StoryPreview from '../components/StoryPreview';
import CameraCapture from '../components/CameraCapture';

const EditProfilePage: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  const [donnees, setDonnees] = useState<Partial<Profil>>({
    name: '', raw_story: '', reformulated_story: '', needs: '', urgent_needs: [], usual_place: '', is_public: false, is_archived: false, is_verified: false, image_url: ''
  });
  const [besoins, setBesoins] = useState<{id: string, texte: string, urgent: boolean}[]>([]);
  const [chargement, setChargement] = useState(!!publicId && publicId !== 'new');
  const [sauvegardeEnCours, setSauvegardeEnCours] = useState(false);
  const [reformulationEnCours, setReformulationEnCours] = useState(false);
  const [cameraOuverte, setCameraOuverte] = useState(false);
  const [notif, setNotif] = useState<{msg: string, type: 'ok' | 'err'} | null>(null);

  useEffect(() => {
    if (publicId && publicId !== 'new') {
      obtenirProfilParIdPublic(publicId).then(data => {
        if (data) {
          setDonnees(data);
          if (data.needs) {
            setBesoins(data.needs.split('\n').filter(l => l.trim()).map(l => ({
              id: crypto.randomUUID(),
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

  if (chargement) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-stone-200" /></div>;

  return (
    <div className="min-h-screen bg-[#fdfcfb] dark:bg-stone-950 p-6 md:p-12 grainy admin-grid">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex justify-between items-end border-b border-stone-200 pb-8">
          <div className="space-y-4">
            <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-[10px] font-black uppercase text-stone-400 hover:text-stone-900"><ArrowLeft className="w-4 h-4" /> Annuler</button>
            <h1 className="text-6xl font-impact text-stone-900 dark:text-white uppercase">Édition Registre</h1>
          </div>
          <div className="dymo-label bg-blue-600">ID: {donnees.publicId || 'NOUVEAU'}</div>
        </header>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <section className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-stone-300 tracking-[0.2em]">Notes de Maraude (Brut)</label>
                <div className="flex items-center gap-2 text-[8px] font-mono text-stone-300"><History className="w-3 h-3" /> Source Primaire</div>
              </div>
              <textarea 
                rows={12} 
                value={donnees.raw_story} 
                onChange={e => setDonnees({...donnees, raw_story: e.target.value})} 
                className="w-full bg-stone-50 rounded-2xl p-6 text-sm font-mono border-none focus:ring-2 focus:ring-stone-900 outline-none" 
                placeholder="Saisissez les faits observés et les paroles rapportées..." 
              />
              <button 
                type="button" 
                onClick={declencherIA} 
                disabled={reformulationEnCours || !donnees.raw_story || donnees.raw_story.length < 20}
                className="w-full py-4 bg-blue-50 text-blue-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30 flex items-center justify-center gap-3"
              >
                {reformulationEnCours ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Analyser et Synthétiser (IA)
              </button>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-white p-10 rounded-[3rem] border-2 border-blue-100 shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-5 py-1 text-[8px] font-black uppercase tracking-widest">Rapport Factuel IA</div>
              <label className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] flex items-center gap-2">
                Synthèse Consolidée <ShieldAlert className="w-3 h-3" />
              </label>
              <textarea 
                rows={10} 
                value={donnees.reformulated_story} 
                onChange={e => setDonnees({...donnees, reformulated_story: e.target.value})} 
                className="w-full bg-blue-50/20 rounded-2xl p-6 text-lg font-serif italic border-none focus:ring-2 focus:ring-blue-600 outline-none" 
                placeholder="La synthèse apparaîtra ici après analyse..." 
              />
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-4">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-[9px] text-amber-800 font-bold uppercase leading-tight">Vigilance : Relisez attentivement. Supprimez toute déduction que vous n'avez pas constatée personnellement.</p>
              </div>
            </section>

            <section className="bg-stone-900 text-white p-10 rounded-[3rem] space-y-6 shadow-2xl">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase text-stone-500">Identité</label>
                  <input type="text" value={donnees.name} onChange={e => setDonnees({...donnees, name: e.target.value})} className="w-full bg-transparent border-b border-stone-800 outline-none font-serif text-xl pb-2 focus:border-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase text-stone-500">Localisation</label>
                  <input type="text" value={donnees.usual_place} onChange={e => setDonnees({...donnees, usual_place: e.target.value})} className="w-full bg-transparent border-b border-stone-800 outline-none font-serif text-xl pb-2 focus:border-white transition-colors" />
                </div>
              </div>
              <button type="submit" disabled={sauvegardeEnCours} className="w-full py-6 bg-white text-stone-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-xl">
                {sauvegardeEnCours ? 'INDEXATION EN COURS...' : 'FIXER L\'EXISTENCE AU REGISTRE'}
              </button>
            </section>
          </div>
        </form>
      </div>

      <AnimatePresence>
        {notif && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className={`fixed bottom-10 right-10 z-[100] px-8 py-4 rounded-xl flex items-center gap-4 shadow-2xl border ${notif.type === 'ok' ? 'bg-stone-900 text-white' : 'bg-red-900 text-white'}`}>
            {notif.type === 'ok' ? <CheckCircle2 className="w-5 h-5 text-blue-500" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{notif.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditProfilePage;
