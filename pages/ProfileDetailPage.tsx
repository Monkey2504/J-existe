
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Heart, Share2, ExternalLink,
  CreditCard, User, Zap, ShieldCheck, CheckCircle2, X,
  FileText, History, Info, Paperclip, Printer, Download,
  Hash
} from 'lucide-react';

// Fixed: Corrected function names and type name according to mockSupabase.ts and types.ts
import { obtenirProfilParIdPublic, incrementerStatistique } from '../services/mockSupabase.ts';
import { Profil } from '../types.ts';

// ------------------------------------------------------------
// Types locaux
// ------------------------------------------------------------
interface BesoinAvecUrgence {
  raw: string;
  texte: string;
  urgent: boolean;
}

interface Notification {
  type: 'succès' | 'erreur';
  message: string;
}

const useProfilDetail = (publicId: string | undefined) => {
  const [profil, setProfil] = useState<Profil | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!publicId) {
      setErreur('Identifiant manquant');
      setChargement(false);
      return;
    }

    // Fixed: Using correct function names
    obtenirProfilParIdPublic(publicId).then(data => {
      if (!data) setErreur('Profil introuvable');
      else {
        setProfil(data);
        incrementerStatistique(publicId, 'views');
      }
      setChargement(false);
    });
  }, [publicId]);

  const gererClicBesoin = useCallback((besoinTexte: string) => {
    // Fixed: Using correct function name
    if (publicId) incrementerStatistique(publicId, 'needs_clicks');
    window.open(`https://www.google.com/search?q=${encodeURIComponent(besoinTexte + ' aide social Bruxelles')}`, '_blank');
  }, [publicId]);

  const besoinsTries = useMemo<BesoinAvecUrgence[]>(() => {
    if (!profil?.needs) return [];
    return profil.needs.split('\n').filter(l => l.trim()).map(l => {
      const texte = l.replace(/^[-\s•]+/, '').trim();
      return { raw: l, texte, urgent: profil.urgent_needs?.includes(texte) || false };
    }).sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
  }, [profil]);

  return { profil, chargement, erreur, besoinsTries, gererClicBesoin };
};

const ProfileDetailPage: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  const { profil, chargement, erreur, besoinsTries, gererClicBesoin } = useProfilDetail(publicId);
  const [notif, setNotif] = useState<Notification | null>(null);

  if (chargement) return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center">
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="font-impact text-white text-5xl tracking-[0.2em] uppercase">
        DOSSIER_RECHERCHE...
      </motion.div>
    </div>
  );

  if (erreur || !profil) return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 space-y-6">
      <div className="text-stone-300"><Info className="w-16 h-16" /></div>
      <h2 className="text-3xl font-impact text-stone-900 uppercase tracking-tighter">Sujet non répertorié</h2>
      <button onClick={() => navigate('/profiles')} className="px-8 py-3 bg-stone-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Retour à l'index</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-40 grainy admin-grid">
      {/* Barre de navigation simplifiée "Archive" */}
      <nav className="sticky top-0 z-50 px-8 py-5 bg-[#FDFCFB]/90 backdrop-blur-xl flex justify-between items-center border-b border-stone-100">
        <button onClick={() => navigate('/profiles')} className="flex items-center gap-3 text-stone-400 hover:text-stone-900 transition-all group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Retour Registre</span>
        </button>
        <div className="flex items-center gap-6">
           <div className="hidden md:flex items-center gap-4 text-stone-300">
              <Printer className="w-4 h-4 cursor-pointer hover:text-stone-900" />
              <Download className="w-4 h-4 cursor-pointer hover:text-stone-900" />
           </div>
           <div className="dymo-label text-[9px]">DOC_REF: {profil.publicId.toUpperCase()}</div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* Colonne Gauche : Le Dossier */}
          <div className="lg:col-span-8 space-y-32">
            
            <header className="relative flex flex-col md:flex-row gap-16 items-start md:items-end">
              {/* Photo Portrait "Agrafée" au dossier */}
              <div className="relative shrink-0 rotate-[-3deg] z-10">
                <div className="w-64 h-80 lg:w-96 lg:h-[32rem] bg-white p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] border border-stone-100">
                  <div className="w-full h-full overflow-hidden bg-stone-100 relative">
                    {profil.image_url ? (
                      <img src={profil.image_url} alt={profil.name} className="w-full h-full object-cover grayscale brightness-90 contrast-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-200"><User className="w-24 h-24" /></div>
                    )}
                    {/* Filtre de grain sur l'image */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E')]"></div>
                  </div>
                </div>
                {/* Agrafes */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-12">
                   <div className="w-6 h-2 bg-stone-400/40 rounded-sm" />
                   <div className="w-6 h-2 bg-stone-400/40 rounded-sm" />
                </div>
                {/* Tampon de Vérification */}
                {profil.is_verified && (
                  <div className="absolute -bottom-10 -right-10 z-20">
                    <div className="stamp-effect px-6 py-4 rounded-lg flex flex-col items-center">
                      <ShieldCheck className="w-8 h-8 mb-1" />
                      <span className="text-xl leading-none">VÉRIFIÉ</span>
                      <span className="text-[8px] font-mono mt-1">S_SOCIAL_BXL</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-8 flex-1">
                <div className="flex flex-col gap-2">
                   <div className="font-mono text-[10px] text-blue-600 font-bold tracking-[0.4em] uppercase">Rapport de Présence</div>
                   <h1 className="text-[18vw] lg:text-[14vw] font-impact text-stone-900 leading-[0.7] tracking-tighter uppercase">
                     {profil.name}
                   </h1>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-stone-400 font-mono text-xs uppercase tracking-widest">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Secteur: {profil.usual_place}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     <span className="px-3 py-1 bg-stone-100 rounded text-[9px] font-bold text-stone-500 font-mono uppercase">ID: {profil.publicId.toUpperCase()}</span>
                     <span className="px-3 py-1 bg-stone-100 rounded text-[9px] font-bold text-stone-500 font-mono uppercase">LOC: BRU_REG_50.85</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Le Rapport Clinique / Narratif */}
            <section className="relative space-y-16">
               <div className="absolute -left-8 top-0 bottom-0 w-[1px] bg-stone-100 hidden lg:block" />
               <div className="space-y-10">
                 <div className="flex items-center gap-6">
                   <div className="p-4 bg-stone-900 text-white rounded-2xl"><FileText className="w-6 h-6" /></div>
                   <h2 className="font-mono text-[11px] font-extrabold uppercase tracking-[0.5em] text-stone-300">Synthèse Administrative du Parcours</h2>
                 </div>
                 
                 <div className="relative group">
                   <p className="text-3xl md:text-5xl font-serif font-medium text-stone-800 leading-[1.3] italic border-l-4 border-stone-50 pl-10">
                     « {profil.reformulated_story} »
                   </p>
                   {/* Annotation de bas de page */}
                   <div className="mt-16 flex items-center gap-6 text-stone-300 border-t border-stone-50 pt-8">
                     <div className="flex items-center gap-2">
                        <History className="w-4 h-4" />
                        <span className="font-mono text-[9px] uppercase">Rapport finalisé: {new Date(profil.created_at).toLocaleDateString('fr-BE', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                     </div>
                     <span className="font-mono text-[9px] uppercase px-2 py-0.5 border border-stone-100 rounded">CONFIDENTIEL</span>
                   </div>
                 </div>
               </div>
            </section>

            {/* Actions & Besoins */}
            <section className="space-y-16">
               <div className="flex items-center justify-between border-b-2 border-stone-100 pb-6">
                 <h2 className="font-mono text-[11px] font-extrabold uppercase tracking-[0.5em] text-stone-300 flex items-center gap-4">
                    <Zap className="w-5 h-5 text-amber-500" /> 
                    Réquisitions Prioritaires
                 </h2>
                 <span className="font-mono text-[9px] text-stone-400 italic">Intervention direct requise</span>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {besoinsTries.map((besoin, idx) => (
                   <button
                    key={idx}
                    onClick={() => gererClicBesoin(besoin.texte)}
                    className={`group relative p-10 rounded-[2.5rem] border text-left transition-all duration-500 flex flex-col gap-6 active:scale-95 ${
                      besoin.urgent 
                      ? 'bg-amber-50 border-amber-200 shadow-[0_20px_40px_-10px_rgba(245,158,11,0.1)]' 
                      : 'bg-white border-stone-100 paper-shadow hover:border-blue-600'
                    }`}
                   >
                     <div className="flex justify-between items-start">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          besoin.urgent ? 'bg-amber-500 text-white shadow-lg' : 'bg-stone-50 text-stone-400 group-hover:bg-blue-600 group-hover:text-white'
                        }`}>
                            {besoin.urgent ? <Zap className="w-5 h-5 fill-white" /> : <Hash className="w-4 h-4" />}
                        </div>
                        <ExternalLink className="w-4 h-4 text-stone-200 group-hover:text-blue-600 transition-colors" />
                     </div>
                     
                     <div className="space-y-2">
                        <span className={`font-serif italic text-3xl leading-tight block ${besoin.urgent ? 'text-amber-900 font-bold' : 'text-stone-800'}`}>
                          {besoin.texte}
                        </span>
                        {besoin.urgent && (
                          <div className="font-mono text-[8px] font-black uppercase tracking-widest text-amber-600 bg-amber-100 px-2 py-1 rounded inline-block">Besoin critique</div>
                        )}
                     </div>
                   </button>
                 ))}
               </div>
            </section>
          </div>

          {/* Colonne Droite : Le Module de Soutien */}
          <div className="lg:col-span-4 space-y-12">
             <div className="lg:sticky lg:top-32 space-y-10">
               
               {/* Carte de Soutien Financier */}
               <div className="bg-stone-900 text-white p-12 rounded-[4rem] space-y-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden border border-white/10">
                 <div className="relative z-10 space-y-8">
                   <div className="space-y-4">
                      <div className="dymo-label bg-blue-600">ACTION_IMMÉDIATE</div>
                      <h3 className="font-impact text-5xl uppercase tracking-tighter leading-none">RESTAURER L'EXISTENCE</h3>
                      <p className="font-serif italic text-stone-400 text-xl leading-relaxed">Votre soutien permet de financer les besoins matériels listés ci-contre.</p>
                   </div>
                   
                   <div className="grid grid-cols-3 gap-4">
                     {[10, 20, 50].map(v => (
                       <button key={v} className="py-5 border border-white/10 rounded-2xl font-impact text-2xl hover:bg-white hover:text-stone-900 transition-all active:scale-95 group relative overflow-hidden">
                         <span className="relative z-10">{v}€</span>
                         <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                       </button>
                     ))}
                   </div>
                   
                   <button className="w-full py-6 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center gap-4 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 active:scale-[0.98]">
                     <CreditCard className="w-5 h-5" /> Confirmer le soutien
                   </button>
                 </div>
                 
                 {/* Background Graphic */}
                 <div className="absolute -bottom-20 -right-20 opacity-[0.03]">
                    <Heart className="w-80 h-80 fill-white" />
                 </div>
               </div>

               {/* QR de Partage Style Certificat */}
               <div className="bg-white p-12 rounded-[4rem] border border-stone-100 paper-shadow flex flex-col items-center gap-10 relative">
                 <Paperclip className="absolute top-8 right-8 text-stone-200 rotate-12" />
                 <div className="p-6 bg-stone-50 rounded-[2.5rem] border border-stone-100 shadow-inner">
                    <QRCodeSVG value={window.location.href} size={160} level="H" fgColor="#121110" />
                 </div>
                 <div className="text-center space-y-4">
                    <div className="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-stone-300">Validation Permanente</div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setNotif({ type: 'succès', message: 'Lien du dossier copié' });
                      }}
                      className="group flex flex-col items-center gap-2"
                    >
                      <span className="text-[10px] font-black text-stone-900 uppercase tracking-widest border-b border-stone-200 group-hover:border-blue-600 transition-all">Copier URL Registre</span>
                      <Share2 className="w-4 h-4 text-stone-200 group-hover:text-blue-600 transition-colors" />
                    </button>
                 </div>
               </div>

               {/* Métriques d'Impact */}
               <div className="grid grid-cols-2 gap-6 px-4">
                  <div className="p-8 bg-white rounded-3xl border border-stone-100 paper-shadow text-center space-y-1">
                    <div className="text-3xl font-impact text-stone-900">{profil.views || 0}</div>
                    <div className="text-[8px] font-mono font-bold uppercase text-stone-300 tracking-widest">Consultations</div>
                  </div>
                  <div className="p-8 bg-white rounded-3xl border border-stone-100 paper-shadow text-center space-y-1">
                    <div className="text-3xl font-impact text-stone-900">{profil.needs_clicks || 0}</div>
                    <div className="text-[8px] font-mono font-bold uppercase text-stone-300 tracking-widest">Tentatives_Aide</div>
                  </div>
               </div>

             </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {notif && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="fixed bottom-10 right-10 z-[100] px-8 py-5 bg-stone-900 text-white rounded-2xl flex items-center gap-6 shadow-2xl border border-white/10">
             <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
               <CheckCircle2 className="w-5 h-5" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notif.message}</span>
             <button onClick={() => setNotif(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(ProfileDetailPage);
