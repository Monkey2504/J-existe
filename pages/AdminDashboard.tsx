
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Profile } from '../types';
import { getProfiles, deleteProfile, toggleArchiveProfile } from '../services/mockSupabase';
import { 
  Search, 
  Eye, 
  Edit2, 
  Trash2, 
  UserPlus,
  ClipboardList,
  BarChart3,
  TrendingUp,
  MousePointer2,
  Share2,
  Unlock,
  Archive,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'archived' | 'stats'>('active');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProfiles();
      setProfiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleArchive = async (id: string) => {
    await toggleArchiveProfile(id);
    fetchProfiles();
  };

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      const isCorrectStatus = activeTab === 'archived' ? p.is_archived : !p.is_archived;
      if (!isCorrectStatus) return false;
      
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(term) || p.usual_place?.toLowerCase().includes(term);
    });
  }, [profiles, searchTerm, activeTab]);

  const globalStats = useMemo(() => {
    return {
      totalViews: profiles.reduce((acc, p) => acc + (p.views || 0), 0),
      totalClicks: profiles.reduce((acc, p) => acc + (p.needs_clicks || 0), 0),
      totalShares: profiles.reduce((acc, p) => acc + (p.shares_count || 0), 0),
      avgEngagement: profiles.length ? (profiles.reduce((acc, p) => acc + (p.needs_clicks || 0), 0) / profiles.length).toFixed(1) : 0
    };
  }, [profiles]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Notice Mode Ouvert */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-4 text-amber-800 shadow-sm">
          <div className="p-2 bg-amber-100 rounded-full"><Unlock className="w-5 h-5" /></div>
          <p className="text-sm font-medium">Mode démo : L'espace professionnel est actuellement ouvert sans authentification.</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-impact text-stone-900 uppercase tracking-tight">Tableau de bord</h1>
            <p className="text-stone-400 font-serif italic mt-1">Gestion des présences et suivi d'impact</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              to="/je-cree-ma-fiche"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-stone-900 text-stone-900 rounded-xl hover:bg-stone-50 transition-colors font-black uppercase tracking-widest text-[10px]"
            >
              <ClipboardList className="w-4 h-4" />
              Mode Questionnaire
            </Link>
            
            <Link
              to="/admin/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors font-black uppercase tracking-widest text-[10px]"
            >
              <UserPlus className="w-4 h-4" />
              Saisie Directe
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-8 py-4 font-black text-[10px] uppercase tracking-[0.3em] transition-all ${activeTab === 'active' ? 'border-b-4 border-stone-900 text-stone-900' : 'text-stone-300 hover:text-stone-500'}`}
          >
            Profils Actifs
          </button>
          <button 
            onClick={() => setActiveTab('archived')}
            className={`px-8 py-4 font-black text-[10px] uppercase tracking-[0.3em] transition-all ${activeTab === 'archived' ? 'border-b-4 border-stone-900 text-stone-900' : 'text-stone-300 hover:text-stone-500'}`}
          >
            Archives ({profiles.filter(p => p.is_archived).length})
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`px-8 py-4 font-black text-[10px] uppercase tracking-[0.3em] transition-all ${activeTab === 'stats' ? 'border-b-4 border-stone-900 text-stone-900' : 'text-stone-300 hover:text-stone-500'}`}
          >
            Statistiques
          </button>
        </div>

        {activeTab !== 'stats' ? (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden">
             <div className="p-8 border-b border-stone-50">
                <div className="relative max-w-md">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-200 w-4 h-4" />
                   <input 
                      type="text" 
                      placeholder={`Chercher parmi les ${activeTab === 'active' ? 'actifs' : 'archivés'}...`} 
                      className="w-full pl-12 pr-6 py-3 bg-stone-50 border border-stone-100 rounded-xl outline-none focus:ring-2 focus:ring-stone-900 transition-all font-serif italic"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                   />
                </div>
             </div>
             
             <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50 text-left text-[10px] uppercase tracking-widest text-stone-400 font-black">
                    <tr>
                        <th className="px-8 py-5">Identité</th>
                        <th className="px-8 py-5">Secteur</th>
                        <th className="px-8 py-5">Visibilité</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {filteredProfiles.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-20 text-center space-y-3">
                          <AlertCircle className="w-8 h-8 text-stone-200 mx-auto" />
                          <p className="font-serif italic text-stone-400">Aucun profil trouvé dans cette section.</p>
                        </td>
                      </tr>
                    ) : filteredProfiles.map(p => (
                        <tr key={p.id} className="hover:bg-stone-50/50 transition-colors group">
                          <td className="px-8 py-6">
                              <div className="font-serif font-bold text-stone-900 text-lg">{p.name}</div>
                              <div className="text-[9px] text-stone-300 font-mono uppercase">ID: {p.publicId}</div>
                          </td>
                          <td className="px-8 py-6 text-stone-500 font-serif italic">{p.usual_place}</td>
                          <td className="px-8 py-6">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${p.is_public ? 'bg-blue-50 text-blue-600' : 'bg-stone-100 text-stone-400'}`}>
                                {p.is_public ? 'Publié' : 'Brouillon'}
                              </span>
                          </td>
                          <td className="px-8 py-6 text-right space-x-2">
                              <Link to={`/admin/edit/${p.publicId}`} className="p-3 text-stone-400 hover:text-stone-900 hover:bg-white rounded-xl inline-block transition-all paper-shadow">
                                <Edit2 className="w-4 h-4" />
                              </Link>
                              <button 
                                onClick={() => handleArchive(p.id)} 
                                className="p-3 text-stone-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all paper-shadow"
                                title={p.is_archived ? "Désarchiver" : "Archiver"}
                              >
                                {p.is_archived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                              </button>
                              <button onClick={() => setShowDeleteConfirm(p.id)} className="p-3 text-stone-400 hover:text-red-600 hover:bg-white rounded-xl transition-all paper-shadow">
                                <Trash2 className="w-4 h-4" />
                              </button>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Global Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2.5rem] border border-stone-100 paper-shadow flex items-center gap-6">
                <div className="p-5 bg-stone-50 rounded-2xl text-stone-900"><Eye className="w-6 h-6" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-300 mb-1">Vues Totales</p>
                  <p className="text-3xl font-impact text-stone-900">{globalStats.totalViews}</p>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-[2.5rem] border border-stone-100 paper-shadow flex items-center gap-6">
                <div className="p-5 bg-stone-50 rounded-2xl text-stone-900"><MousePointer2 className="w-6 h-6" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-300 mb-1">Actions Besoins</p>
                  <p className="text-3xl font-impact text-stone-900">{globalStats.totalClicks}</p>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-8 rounded-[2.5rem] border border-stone-100 paper-shadow flex items-center gap-6">
                <div className="p-5 bg-stone-50 rounded-2xl text-stone-900"><Share2 className="w-6 h-6" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-300 mb-1">Partages</p>
                  <p className="text-3xl font-impact text-stone-900">{globalStats.totalShares}</p>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-8 rounded-[2.5rem] border border-stone-100 paper-shadow flex items-center gap-6">
                <div className="p-5 bg-stone-50 rounded-2xl text-stone-900"><TrendingUp className="w-6 h-6" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-300 mb-1">Engagement</p>
                  <p className="text-3xl font-impact text-stone-900">{globalStats.avgEngagement}</p>
                </div>
              </motion.div>
            </div>

            {/* Detailed Table Stats */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden">
               <div className="p-8 border-b border-stone-50 flex items-center justify-between">
                  <h3 className="text-xl font-impact uppercase text-stone-900">Performance par existence</h3>
                  <BarChart3 className="text-stone-200 w-5 h-5" />
               </div>
               <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-stone-50 text-[10px] uppercase tracking-widest text-stone-400 font-black">
                      <tr>
                        <th className="px-8 py-5">Nom</th>
                        <th className="px-8 py-5">Vues</th>
                        <th className="px-8 py-5">Actions Besoins</th>
                        <th className="px-8 py-5">Partages</th>
                        <th className="px-8 py-5">Taux d'intérêt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {[...profiles].sort((a,b) => (b.views || 0) - (a.views || 0)).map(p => {
                        const interestRate = p.views ? (( (p.needs_clicks || 0) / p.views ) * 100).toFixed(1) : 0;
                        return (
                          <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                            <td className="px-8 py-6 font-serif font-bold text-stone-900">{p.name}</td>
                            <td className="px-8 py-6 text-stone-600 font-mono text-xs">{p.views || 0}</td>
                            <td className="px-8 py-6 text-stone-600 font-mono text-xs">{p.needs_clicks || 0}</td>
                            <td className="px-8 py-6 text-stone-600 font-mono text-xs">{p.shares_count || 0}</td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-32 h-1.5 bg-stone-50 rounded-full overflow-hidden">
                                  <div className="h-full bg-stone-900" style={{ width: `${Math.min(Number(interestRate), 100)}%` }}></div>
                                </div>
                                <span className="text-[10px] font-black text-stone-400">{interestRate}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                </table>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
           <div className="bg-white p-12 rounded-[3.5rem] max-w-sm w-full text-center space-y-8 paper-shadow">
              <h3 className="text-3xl font-impact text-stone-900 uppercase leading-none">Supprimer définitivement ?</h3>
              <p className="text-stone-500 font-serif italic text-lg leading-relaxed">Cette action effacera toute trace numérique de ce profil dans notre registre public.</p>
              <div className="flex flex-col gap-3">
                 <button onClick={() => deleteProfile(showDeleteConfirm).then(() => { fetchProfiles(); setShowDeleteConfirm(null); })} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all">Supprimer l'existence</button>
                 <button onClick={() => setShowDeleteConfirm(null)} className="w-full py-4 bg-stone-100 text-stone-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-stone-200 transition-all">Conserver</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(AdminDashboard);
