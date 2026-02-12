
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Edit2, Trash2, Archive, RotateCcw, AlertCircle, X,
  Database, Shield, TrendingUp, CheckCircle2,
  MapPin, BarChart3, MoreVertical
} from 'lucide-react';

import { Profil } from '../types.ts';
import { obtenirProfils, supprimerProfil, basculerArchiveProfil } from '../services/mockSupabase.ts';

const useGestionTableauDeBord = () => {
  const [listeProfils, setListeProfils] = useState<Profil[]>([]);
  const [chargement, setChargement] = useState(true);
  const [ongletActif, setOngletActif] = useState<'actifs' | 'archives' | 'stats'>('actifs');
  const [recherche, setRecherche] = useState('');
  const [rechercheDebouncee, setRechercheDebouncee] = useState('');
  const [notification, setNotification] = useState<{message: string, type: 'succes' | 'erreur'} | null>(null);

  useEffect(() => {
    const minuteur = setTimeout(() => setRechercheDebouncee(recherche), 300);
    return () => clearTimeout(minuteur);
  }, [recherche]);

  const rafraichirDonnees = useCallback(async (signal?: AbortSignal) => {
    try {
      setChargement(true);
      const donnees = await obtenirProfils();
      if (signal?.aborted) return;
      setListeProfils(donnees);
    } catch (erreur) {
      setNotification({ message: "Erreur lors du chargement des dossiers.", type: 'erreur' });
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    const controleur = new AbortController();
    rafraichirDonnees(controleur.signal);
    return () => controleur.abort();
  }, [rafraichirDonnees]);

  const gererArchive = useCallback(async (id: string) => {
    setListeProfils(prev => prev.map(p => p.id === id ? { ...p, is_archived: !p.is_archived } : p));
    try {
      await basculerArchiveProfil(id);
      setNotification({ message: "Statut d'archivage mis à jour.", type: 'succes' });
    } catch (e) {
      rafraichirDonnees();
      setNotification({ message: "Échec de l'archivage.", type: 'erreur' });
    }
  }, [rafraichirDonnees]);

  const gererSuppression = useCallback(async (id: string) => {
    if (!window.confirm("Supprimer ce dossier définitivement du registre ?")) return;
    const sauvegarde = [...listeProfils];
    setListeProfils(prev => prev.filter(p => p.id !== id));
    try {
      await supprimerProfil(id);
      setNotification({ message: "Dossier effacé avec succès.", type: 'succes' });
    } catch (e) {
      setListeProfils(sauvegarde);
      setNotification({ message: "Erreur lors de la suppression.", type: 'erreur' });
    }
  }, [listeProfils]);

  const profilsFiltres = useMemo(() => {
    const terme = rechercheDebouncee.toLowerCase();
    return listeProfils.filter(p => {
      const correspondRecherche = p.name.toLowerCase().includes(terme) || p.usual_place.toLowerCase().includes(terme);
      const correspondOnglet = ongletActif === 'archives' ? p.is_archived : !p.is_archived;
      return correspondRecherche && correspondOnglet;
    });
  }, [listeProfils, rechercheDebouncee, ongletActif]);

  const statistiques = useMemo(() => ({
    actifs: listeProfils.filter(p => !p.is_archived).length,
    vues: listeProfils.reduce((acc, p) => acc + (p.views || 0), 0),
    interactions: listeProfils.reduce((acc, p) => acc + (p.needs_clicks || 0), 0)
  }), [listeProfils]);

  return { 
    profils: profilsFiltres, statistiques, chargement, ongletActif, setOngletActif, recherche, setRecherche, 
    gererArchive, gererSuppression, notification, setNotification 
  };
};

const AdminDashboard: React.FC = () => {
  const { 
    profils, statistiques, chargement, ongletActif, setOngletActif, recherche, setRecherche, 
    gererArchive, gererSuppression, notification, setNotification 
  } = useGestionTableauDeBord();

  return (
    <div className="min-h-screen bg-[#f8f7f4] dark:bg-stone-950 pb-40 grainy admin-grid">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-32 space-y-8 sm:y-12" aria-busy={chargement}>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-stone-200 dark:border-stone-800 pb-8 sm:pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="font-mono text-[10px] font-black text-blue-600 uppercase tracking-widest">Registre Social Bruxelles</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-impact text-stone-900 dark:text-white uppercase tracking-tighter leading-none">
              ADMINISTRATION <br /> <span className="text-stone-300 dark:text-stone-700">DU REGISTRE</span>
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link to="/je-cree-ma-fiche" className="px-6 py-4 bg-white dark:bg-stone-900 border-2 border-stone-900 dark:border-stone-700 text-stone-900 dark:text-white rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-stone-50 shadow-lg text-center">Nouveau Recensement</Link>
            <Link to="/admin/new" className="px-6 py-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-stone-800 shadow-xl text-center">Saisie Express</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
          {[
            { label: 'Dossiers Actifs', val: statistiques.actifs, icon: Database },
            { label: 'Visibilité Totale', val: statistiques.vues, icon: TrendingUp },
            { label: "Appels à l'Aide", val: statistiques.interactions, icon: BarChart3 }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-stone-100 dark:border-stone-800 paper-shadow flex items-center gap-6">
              <div className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-800 rounded-2xl"><stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-stone-900 dark:text-white" /></div>
              <div><p className="font-mono text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-stone-300">{stat.label}</p><p className="text-3xl sm:text-4xl font-impact text-stone-900 dark:text-white">{stat.val}</p></div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 sm:pt-12">
          <nav className="flex bg-white dark:bg-stone-900 p-1 rounded-2xl border border-stone-100 dark:border-stone-800 paper-shadow overflow-x-auto w-full md:w-auto no-scrollbar">
            {(['actifs', 'archives', 'stats'] as const).map(onglet => (
              <button 
                key={onglet}
                onClick={() => setOngletActif(onglet)} 
                className={`px-6 sm:px-8 py-3 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${ongletActif === onglet ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900' : 'text-stone-300 hover:text-stone-900'}`}
              >
                {onglet}
              </button>
            ))}
          </nav>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-4 h-4" />
            <input
              type="search" value={recherche} onChange={(e) => setRecherche(e.target.value)}
              placeholder="RECHERCHER..."
              className="w-full bg-white dark:bg-stone-900 pl-12 pr-6 py-4 rounded-2xl border border-stone-100 dark:border-stone-800 paper-shadow outline-none focus:ring-2 focus:ring-blue-600 font-mono text-[9px] uppercase tracking-widest dark:text-white"
            />
          </div>
        </div>

        {/* Vue Mobile : Cartes / Vue Desktop : Tableau */}
        <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] sm:rounded-[3.5rem] border border-stone-100 dark:border-stone-800 paper-shadow overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50/50 dark:bg-stone-800/50 font-mono text-[9px] uppercase tracking-[0.4em] text-stone-400">
                <tr>
                  <th className="px-8 py-6">Dossier / Identité</th>
                  <th className="px-8 py-6">Localisation</th>
                  <th className="px-8 py-6">Statut</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50 dark:divide-stone-800">
                {profils.map((p) => (
                  <tr key={p.id} className="group hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-serif font-black text-stone-900 dark:text-white text-lg uppercase tracking-tight">{p.name}</div>
                      <div className="font-mono text-[9px] text-stone-300 uppercase">FILE: {p.publicId.toUpperCase()}</div>
                    </td>
                    <td className="px-8 py-6 text-stone-500 font-serif italic text-sm">
                      <div className="flex items-center gap-2"><MapPin className="w-3 h-3 text-blue-600" /> {p.usual_place}</div>
                    </td>
                    <td className="px-8 py-6"><div className={`dymo-label text-[8px] ${p.is_public ? 'bg-blue-600' : 'bg-stone-400'}`}>{p.is_public ? 'PUBLIC' : 'PRIVÉ'}</div></td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/admin/edit/${p.publicId}`} className="p-3 bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-xl hover:bg-stone-900 hover:text-white transition-all"><Edit2 className="w-4 h-4" /></Link>
                        <button onClick={() => gererArchive(p.id)} className="p-3 bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-xl hover:text-blue-600 transition-all">{p.is_archived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}</button>
                        <button onClick={() => gererSuppression(p.id)} className="p-3 bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-xl hover:text-red-600 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Version Mobile empilée */}
          <div className="md:hidden divide-y divide-stone-50 dark:divide-stone-800">
            {profils.map((p) => (
              <div key={p.id} className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif font-black text-xl text-stone-900 dark:text-white uppercase tracking-tight">{p.name}</h3>
                    <p className="font-mono text-[8px] text-stone-300 uppercase tracking-widest mt-1">ID: {p.publicId.split('-').pop()}</p>
                  </div>
                  <div className={`dymo-label text-[7px] ${p.is_public ? 'bg-blue-600' : 'bg-stone-400'}`}>{p.is_public ? 'PUBLIC' : 'PRIVÉ'}</div>
                </div>
                <div className="flex items-center gap-2 text-stone-500 font-serif italic text-xs"><MapPin className="w-3 h-3 text-blue-600" /> {p.usual_place}</div>
                <div className="flex gap-2 pt-2">
                  <Link to={`/admin/edit/${p.publicId}`} className="flex-1 py-3 bg-stone-50 dark:bg-stone-800 rounded-xl flex items-center justify-center gap-2 font-black text-[8px] uppercase tracking-widest"><Edit2 className="w-3 h-3" /> Modifier</Link>
                  <button onClick={() => gererArchive(p.id)} className="p-3 bg-stone-50 dark:bg-stone-800 rounded-xl text-stone-400"><Archive className="w-4 h-4" /></button>
                  <button onClick={() => gererSuppression(p.id)} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>

          {profils.length === 0 && !chargement && (
            <div className="py-20 text-center font-serif italic text-stone-400">Aucun dossier trouvé.</div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-24 sm:bottom-10 right-4 sm:right-10 z-[100] px-6 sm:px-8 py-4 rounded-2xl flex items-center gap-4 shadow-2xl border bg-stone-900 text-white border-white/10`}
          >
            {notification.type === 'succes' ? <CheckCircle2 className="w-5 h-5 text-blue-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(AdminDashboard);
