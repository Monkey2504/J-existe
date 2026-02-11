
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Heart, Share2, CornerRightDown, Search as SearchIcon, ExternalLink, CreditCard, User, Zap } from 'lucide-react';
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
        // Incrémenter les vues
        incrementStat(publicId, 'views');
      });
    }
  }, [publicId]);

  const handleNeedClick = useCallback((need: string) => {
    if (publicId) incrementStat(publicId, 'needs_clicks');
    
    const rawNeed = need.replace(/^[-\s•]+/, '').trim();
    const cleanNeedLower = rawNeed.toLowerCase();
    const isServiceOrConsumable = /ticket|stib|médicament|pharmacie|nourriture|repas|soins|hygiène|douche|bus|tram|métro/.test(cleanNeedLower);
    
    let query = "";
    if (isServiceOrConsumable) {
      query = encodeURIComponent(`${rawNeed} Bruxelles info aide`);
    } else {
      query = encodeURIComponent(`${rawNeed} occasion donner Bruxelles`);
    }
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  }, [publicId]);

  const handleCopyLink = useCallback(() => {
    if (publicId) incrementStat(publicId, 'shares_count');
    navigator.clipboard.writeText(window.location.href);
    alert('Lien copié !');
  }, [publicId]);

  if (loading || !profil) return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center">
      <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="font-impact text-white text-5xl tracking-widest uppercase">Dossier en chargement</motion.div>
    </div>
  );

  // Séparation des besoins normaux et urgents
  const allNeeds = profil.needs.split('\n').filter(n => n.trim());
  const needsWithUrgency = allNeeds.map(n => {
    const text = n.replace(/^[-\s•]+/, '').trim();
    return {
      raw: n,
      text,
      isUrgent: profil.urgent_needs?.includes(text) || false
    };
  });

  // Trier pour mettre les urgents en premier
  const sortedNeeds = [...needsWithUrgency].sort((a, b) => (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0));

  return (
    <div className="min-h-screen bg-[#f8f7f4] selection:bg-blue-100">
      <div className="fixed top-12 left-12 z-50">
        <button onClick={() => navigate('/profiles')} className="group flex items-center gap-4 text-stone-300 hover:text-stone-900 transition-all duration-500">
          <div className="p-3 border border-stone-100 rounded-full group-hover:border-stone-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Index</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-20 pt-32 pb-60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          <div className="lg:col-span-12">
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.2 }}>
              <div className="flex flex-col lg:flex-row lg:items-end gap-10 mb-12">
                <div className="w-48 h-64 lg:w-64 lg:h-80 shrink-0 rounded-[3rem] overflow-hidden bg-stone-200 border-4 border-white shadow-2xl rotate-[-1deg] relative">
                  {profil.image_url ? (
                    <img src={profil.image_url} alt={profil.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300"><User className="w-16 h-16" /></div>
                  )}
                  {profil.urgent_needs && profil.urgent_needs.length > 0 && (
                    <div className="absolute top-4 left-4 bg-amber-500 text-white p-2 rounded-xl shadow-lg">
                      <Zap className="w-4 h-4 fill-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.8em] mb-4 block">Archive de Terrain</span>
                  <h1 className="text-[14vw] lg:text-[10vw] font-impact text-stone-900 leading-[0.75] tracking-tighter mb-8">{profil.name.toUpperCase()}</h1>
                  <div className="flex flex-wrap items-center gap-6 text-stone-400 font-serif italic text-xl">
                    <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600" /> {profil.usual_place}</div>
                    <div className="w-1 h-1 bg-stone-200 rounded-full" />
                    <div className="text-stone-300">Statut : Signalé présent</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-7 space-y-24">
            <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1.5 }} className="relative border-l-4 border-stone-100 pl-12 py-4">
              <p className="text-3xl md:text-4xl font-serif font-light text-stone-800 leading-[1.4] tracking-tight">
                {profil.reformulated_story}
              </p>
            </motion.section>

            <motion.section className="space-y-12">
              <div className="flex items-end justify-between border-b border-stone-50 pb-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-300">Besoins Réels</h2>
                <span className="text-[9px] font-bold text-stone-300 italic">Cliquez pour agir</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedNeeds.map((need, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleNeedClick(need.raw)} 
                    className={`group relative p-6 border rounded-[1.5rem] flex items-center gap-4 text-left transition-all ${
                      need.isUrgent 
                        ? 'bg-amber-50 border-amber-200 text-stone-900 shadow-lg shadow-amber-500/5 hover:bg-amber-100' 
                        : 'bg-white border-stone-100 text-stone-700 paper-shadow hover:bg-stone-50'
                    }`}
                  >
                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-impact transition-all ${
                      need.isUrgent 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-stone-50 text-stone-300 group-hover:bg-blue-600 group-hover:text-white'
                    }`}>
                      {need.isUrgent ? <Zap className="w-4 h-4 fill-white" /> : i + 1}
                    </div>
                    <div className="flex flex-col">
                      {need.isUrgent && <span className="text-[8px] font-black uppercase tracking-widest text-amber-600 mb-1">Besoin Urgent</span>}
                      <span className="font-serif italic text-lg leading-tight">{need.text}</span>
                    </div>
                    <ExternalLink className={`absolute top-4 right-4 w-3 h-3 transition-colors ${need.isUrgent ? 'text-amber-300' : 'text-stone-100 group-hover:text-blue-200'}`} />
                  </button>
                ))}
              </div>
            </motion.section>
          </div>

          <div className="lg:col-span-5 space-y-12">
            <div className="sticky top-32 space-y-8">
              {/* Module de don Stripe UI */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white p-10 rounded-[3rem] border border-stone-100 paper-shadow space-y-8">
                <div className="space-y-2">
                  <h3 className="font-impact text-4xl text-stone-900 tracking-tight uppercase">Soutenir</h3>
                  <p className="text-stone-400 font-serif italic text-sm">Le don va sur le compte du travailleur social référent pour les besoins de {profil.name}.</p>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {['5€', '10€', '20€'].map(amount => (
                    <button key={amount} className="py-4 border-2 border-stone-50 rounded-2xl font-impact text-2xl text-stone-300 hover:border-blue-600 hover:text-blue-600 transition-all">{amount}</button>
                  ))}
                </div>

                <button className="w-full py-5 bg-blue-600 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 group">
                  <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Don Stripe
                </button>
                
                <div className="flex items-center justify-center gap-4 grayscale opacity-30">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
                </div>
              </motion.div>

              <div className="bg-stone-900 p-10 rounded-[3rem] text-center space-y-8 shadow-2xl">
                <div className="inline-block p-4 bg-white rounded-2xl">
                  <QRCodeSVG value={window.location.href} size={140} fgColor="#121110" level="H" />
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-stone-500 uppercase tracking-[0.4em]">IDENTIFIANT UNIQUE</p>
                  <p className="font-mono text-xs text-white opacity-40 uppercase tracking-tighter">{profil.publicId}</p>
                </div>
                <button onClick={handleCopyLink} className="w-full py-4 border border-stone-800 text-stone-500 rounded-xl font-bold text-[9px] uppercase tracking-widest hover:bg-stone-800 transition-all">Copier le lien</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileDetailPage;
