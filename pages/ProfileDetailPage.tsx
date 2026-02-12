
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Heart, Share2, ExternalLink, CreditCard, User, Zap, ShieldCheck } from 'lucide-react';
import { getProfileByPublicId, incrementStat } from '../services/mockSupabase.ts';
import { Profile } from '../types.ts';

const ProfileDetailPage: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  const [profil, setProfil] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (publicId) {
      getProfileByPublicId(publicId).then(data => {
        setProfil(data);
        setLoading(false);
        incrementStat(publicId, 'views');
      });
    }
  }, [publicId]);

  const handleNeedClick = useCallback((need: string) => {
    if (publicId) incrementStat(publicId, 'needs_clicks');
    const rawNeed = need.replace(/^[-\s•]+/, '').trim();
    window.open(`https://www.google.com/search?q=${encodeURIComponent(rawNeed + ' Bruxelles aide social')}`, '_blank');
  }, [publicId]);

  const sortedNeeds = useMemo(() => {
    if (!profil) return [];
    return profil.needs.split('\n')
      .filter(n => n.trim())
      .map(n => {
        const text = n.replace(/^[-\s•]+/, '').trim();
        return {
          raw: n,
          text,
          isUrgent: profil.urgent_needs?.includes(text) || false
        };
      })
      .sort((a, b) => (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0));
  }, [profil]);

  if (loading || !profil) return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center">
      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="font-impact text-white text-4xl tracking-widest uppercase">Consultation des archives...</motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f7f4] selection:bg-blue-100">
      <div className="fixed top-8 left-8 z-50">
        <button onClick={() => navigate('/profiles')} className="group flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-stone-200 paper-shadow hover:bg-stone-900 hover:text-white transition-all duration-500">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Retour à l'index</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-20 pt-32 pb-60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          <div className="lg:col-span-12">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
              <div className="flex flex-col lg:flex-row lg:items-end gap-12 mb-16">
                <div className="w-56 h-72 lg:w-72 lg:h-96 shrink-0 rounded-[3.5rem] overflow-hidden bg-stone-100 border-8 border-white shadow-2xl rotate-[-1.5deg] relative">
                  {profil.image_url ? (
                    <img src={profil.image_url} alt={profil.name} className="w-full h-full object-cover grayscale" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-200 bg-stone-50"><User className="w-20 h-20" /></div>
                  )}
                  {profil.is_verified && (
                    <div className="absolute bottom-4 right-4 bg-blue-600 text-white p-2 rounded-xl shadow-lg border-2 border-white">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.8em]">Compte-rendu n°{profil.publicId.split('-').pop()}</span>
                    {profil.urgent_needs && profil.urgent_needs.length > 0 && (
                      <span className="px-3 py-1 bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse">Priorité Sociale</span>
                    )}
                  </div>
                  <h1 className="text-[15vw] lg:text-[10vw] font-impact text-stone-900 leading-[0.7] tracking-tighter uppercase">{profil.name}</h1>
                  <div className="flex flex-wrap items-center gap-6 text-stone-400 font-serif italic text-xl">
                    <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600" /> {profil.usual_place}</div>
                    <div className="w-1.5 h-1.5 bg-stone-200 rounded-full" />
                    <div className="text-stone-300">Dossier vérifié par le terrain</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-7 space-y-24">
            <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1.2 }} className="relative border-l-2 border-stone-200 pl-10 md:pl-16 py-2">
              <p className="text-2xl md:text-3xl font-serif font-light text-stone-800 leading-[1.6] tracking-tight whitespace-pre-wrap italic">
                {profil.reformulated_story}
              </p>
            </motion.section>

            <motion.section className="space-y-12">
              <div className="flex items-baseline justify-between border-b border-stone-200 pb-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">Actions & Besoins Réels</h2>
                <div className="flex items-center gap-2 text-stone-300 text-[9px] font-bold italic uppercase tracking-widest">
                  <Zap className="w-3 h-3 text-amber-500" /> Priorité Terrain
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {sortedNeeds.map((need, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleNeedClick(need.raw)} 
                    className={`group relative p-8 rounded-[2rem] flex flex-col gap-4 text-left border transition-all duration-500 ${
                      need.isUrgent 
                        ? 'bg-amber-50 border-amber-200 text-stone-900 shadow-xl shadow-amber-500/5 hover:bg-amber-100' 
                        : 'bg-white border-stone-100 text-stone-700 paper-shadow hover:border-stone-900'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      need.isUrgent 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-stone-50 text-stone-300 group-hover:bg-stone-900 group-hover:text-white'
                    }`}>
                      {need.isUrgent ? <Zap className="w-4 h-4 fill-white" /> : <span className="font-impact text-xl">{i + 1}</span>}
                    </div>
                    <div>
                      {need.isUrgent && <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 block mb-1">Besoin Urgent</span>}
                      <span className="font-serif italic text-xl leading-tight block">{need.text}</span>
                    </div>
                    <ExternalLink className={`absolute top-6 right-6 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all ${need.isUrgent ? 'text-amber-400' : 'text-stone-300'}`} />
                  </button>
                ))}
              </div>
            </motion.section>
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32 space-y-8">
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-xl space-y-10">
                <div className="space-y-4">
                  <h3 className="font-impact text-4xl text-stone-900 tracking-tight uppercase leading-none">Soutien Direct</h3>
                  <p className="text-stone-500 font-serif italic text-base leading-relaxed">Les fonds sont collectés par l'association référente pour financer les besoins listés ici.</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {[5, 10, 20].map(amount => (
                    <button key={amount} className="py-5 border-2 border-stone-50 rounded-2xl font-impact text-2xl text-stone-300 hover:border-blue-600 hover:text-blue-600 transition-all active:scale-95">{amount}€</button>
                  ))}
                </div>

                <button className="w-full py-6 bg-blue-600 text-white rounded-2xl flex items-center justify-center gap-4 font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/20 group active:scale-[0.98]">
                  <CreditCard className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Contribuer via Stripe
                </button>
                
                <div className="flex items-center justify-center gap-4 opacity-20 grayscale scale-75">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-5" />
                </div>
              </motion.div>

              <div className="bg-stone-900 p-12 rounded-[3rem] text-center space-y-8 shadow-2xl border border-white/5">
                <div className="inline-block p-6 bg-white rounded-[2rem] shadow-inner">
                  <QRCodeSVG value={window.location.href} size={160} fgColor="#121110" level="H" marginSize={0} />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.5em]">CERTIFICAT D'EXISTENCE</p>
                  <p className="font-mono text-xs text-blue-400 uppercase tracking-widest">{profil.publicId.toUpperCase()}</p>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Lien copié'); }} className="w-full py-4 border border-stone-800 text-stone-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-stone-900 transition-all">Partager ce profil</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileDetailPage;
