
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Sparkles, User, Loader2,
  AlertCircle, CheckCircle2, Zap, 
  Camera, X, ShieldAlert, History, ImageIcon,
  CreditCard, MapPin, Plus, FileText, Brain, Users, Star, Target, Link as LinkIcon
} from 'lucide-react';

import { Profil } from '../types.ts';
import { obtenirProfilParIdPublic, sauvegarderProfil } from '../services/supabaseService.ts';
import { reformulerRecit, genererImageProfil } from '../services/geminiService.ts';
import CameraCapture from '../components/CameraCapture.tsx';

const EditProfilePage: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  
  const [donnees, setDonnees] = useState<Partial<Profil>>({
    name: '', raw_story: '', bio: '', mental_health: '', 
    family_circle: '', needs: '', passions: '', projects: '',
    usual_place: '', is_public: true, is_archived: false, 
    is_verified: false, image_url: '', donation_url: ''
  });
  
  const [chargement, setChargement] = useState(!!publicId && publicId !== 'new');
  const [sauvegardeEnCours, setSauvegardeEnCours] = useState(false);
  const [iaEnCours, setIaEnCours] = useState(false);
  const [notif, setNotif] = useState<{msg: string, type: 'ok' | 'err'} | null>(null);

  useEffect(() => {
    if (publicId && publicId !== 'new') {
      obtenirProfilParIdPublic(publicId).then(data => {
        if (data) setDonnees(data);
        setChargement(false);
      });
    }
  }, [publicId]);

  const declencherIA = async () => {
    if (!donnees.raw_story || donnees.raw_story.length < 20) {
      return setNotif({ msg: "Récit trop court", type: 'err' });
    }
    setIaEnCours(true);
    try {
      const res = await reformulerRecit(donnees.raw_story);
      if (res) {
        setDonnees(prev => ({ ...prev, ...res }));
        setNotif({ msg: "Indexation réussie", type: 'ok' });
      }
    } catch (e) {
      setNotif({ msg: "Erreur IA", type: 'err' });
    } finally { setIaEnCours(false); }
  };

  const handleSave = async () => {
    if (!donnees.name) return setNotif({ msg: "Nom obligatoire", type: 'err' });
    setSauvegardeEnCours(true);
    try {
      const payload = {
        ...donnees,
        publicId: donnees.publicId || `${donnees.name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`,
        created_at: donnees.created_at || new Date().toISOString()
      } as Profil;
      await sauvegarderProfil(payload);
      setNotif({ msg: "Enregistré", type: 'ok' });
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      setNotif({ msg: "Erreur sauvegarde", type: 'err' });
    } finally { setSauvegardeEnCours(false); }
  };

  if (chargement) return <div className="min-h-screen flex items-center justify-center bg-stone-900 text-white font-impact text-3xl">CHARGEMENT...</div>;

  return (
    <div className="min-h-screen bg-[#f8f7f4] dark:bg-stone-950 pb-40">
      <main className="max-w-4xl mx-auto px-6 pt-24 space-y-12">
        <header className="flex justify-between items-center border-b border-stone-200 dark:border-stone-800 pb-8">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-stone-400 font-black text-[9px] uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <div className="flex gap-4">
            <button onClick={declencherIA} disabled={iaEnCours} className="px-6 py-3 bg-stone-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2">
               {iaEnCours ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} IA ANALYSE
            </button>
            <button onClick={handleSave} disabled={sauvegardeEnCours} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2">
               {sauvegardeEnCours ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldAlert className="w-3 h-3" />} SAUVER
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {/* Notes Brutes */}
          <section className="bg-white dark:bg-stone-900 p-8 rounded-[2rem] shadow-xl border border-stone-100 dark:border-stone-800 space-y-4">
             <label className="font-impact text-xl uppercase text-stone-400">Récit de terrain (Brut)</label>
             <textarea 
               value={donnees.raw_story} 
               onChange={e => setDonnees({...donnees, raw_story: e.target.value})}
               className="w-full bg-stone-50 dark:bg-stone-800 p-6 rounded-xl border-none outline-none font-serif text-lg italic min-h-[150px]"
               placeholder="Saisissez ici les observations brutes..."
             />
          </section>

          {/* Configuration Stripe / Donation */}
          <section className="bg-blue-600 p-8 rounded-[2rem] shadow-xl text-white space-y-4">
             <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5" />
                <label className="font-impact text-xl uppercase tracking-widest">Lien de Soutien (Stripe / PayPal)</label>
             </div>
             <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                <input 
                  type="url" 
                  value={donnees.donation_url || ''} 
                  onChange={e => setDonnees({...donnees, donation_url: e.target.value})}
                  placeholder="https://buy.stripe.com/..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-4 pl-12 text-white placeholder:text-blue-200 outline-none focus:bg-white/20 transition-all font-mono text-sm"
                />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Ce lien sera activé sur le bouton "Soutenir ce parcours" de la fiche publique.</p>
          </section>

          {/* Champs IA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: 'bio', label: 'BIO', icon: FileText },
              { id: 'mental_health', label: 'SANTÉ', icon: Brain },
              { id: 'family_circle', label: 'ENTOURAGE', icon: Users },
              { id: 'passions', label: 'PASSIONS', icon: Star },
              { id: 'projects', label: 'PROJET', icon: Target },
              { id: 'needs', label: 'BESOINS', icon: Zap },
            ].map(field => (
              <div key={field.id} className="bg-white dark:bg-stone-900 p-6 rounded-[2rem] border border-stone-100 dark:border-stone-800 space-y-3">
                <div className="flex items-center gap-2 text-stone-400">
                  <field.icon className="w-4 h-4" />
                  <label className="font-impact text-xs uppercase tracking-widest">{field.label}</label>
                </div>
                <textarea 
                  value={(donnees as any)[field.id]} 
                  onChange={e => setDonnees({...donnees, [field.id]: e.target.value})}
                  className="w-full bg-transparent border-none outline-none font-serif text-lg leading-snug resize-none"
                  rows={3}
                />
              </div>
            ))}
          </div>

          {/* Image & Identité Rapide */}
          <section className="bg-white dark:bg-stone-900 p-8 rounded-[2rem] grid grid-cols-1 md:grid-cols-2 gap-8 items-center border border-stone-100">
             <div className="space-y-4">
                <input 
                  type="text" 
                  value={donnees.name} 
                  onChange={e => setDonnees({...donnees, name: e.target.value})}
                  placeholder="PRÉNOM"
                  className="w-full bg-stone-50 dark:bg-stone-800 p-4 rounded-xl font-impact text-3xl uppercase tracking-tighter"
                />
                <input 
                  type="text" 
                  value={donnees.usual_place} 
                  onChange={e => setDonnees({...donnees, usual_place: e.target.value})}
                  placeholder="LIEU HABITUEL"
                  className="w-full bg-stone-50 dark:bg-stone-800 p-4 rounded-xl font-mono text-[10px] uppercase tracking-widest"
                />
             </div>
             <div className="w-full h-40 bg-stone-100 dark:bg-stone-800 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed border-stone-200">
                {donnees.image_url ? (
                  <img src={donnees.image_url} className="w-full h-full object-cover grayscale" alt="Preview" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-stone-300" />
                )}
             </div>
          </section>
        </div>
      </main>

      <AnimatePresence>
        {notif && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={`fixed bottom-10 right-10 z-[100] px-8 py-4 rounded-2xl bg-stone-900 text-white flex items-center gap-3 shadow-2xl`}>
            {notif.type === 'ok' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
            <span className="font-mono text-[10px] uppercase tracking-widest">{notif.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditProfilePage;
