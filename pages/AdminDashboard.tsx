
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Edit2, Trash2, Archive, RotateCcw, AlertCircle, X,
  MapPin, RefreshCw, Wifi, WifiOff, Database, CheckCircle2
} from 'lucide-react';

import { Profil } from '../types.ts';
import { obtenirProfils, supprimerProfil, basculerArchiveProfil, testerConnexion, peuplerSupabase } from '../services/supabaseService.ts';

const SEED_DATA_PROFILES: Partial<Profil>[] = [
  { 
    publicId: 'jean-pierre-bxl-master', 
    name: 'Jean-Pierre', 
    image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800', 
    raw_story: 'Ancien maçon pendant 30 ans. Accident de chantier il y a 5 ans. Vit à la rue depuis.', 
    reformulated_story: "Pendant trente ans, Jean-Pierre a été un sculpteur de l'ombre au service de l'urbanisme bruxellois. Ses mains, larges et imprégnées par la poussière calcaire du Brabant, connaissent le poids exact d'une brique de parement et la courbe parfaite d'une voûte en plein cintre. De la rénovation des maisons de maître à Ixelles aux chantiers colossaux du quartier européen, il a été l'artisan d'une ville qui aujourd'hui l'ignore. La 'mécanique de la rupture' s'est enclenchée un matin de gel sur un échafaudage mal arrimé : une chute de quatre mètres qui a broyé ses vertèbres lombaires, mais surtout sa fonction sociale. Privé de son corps d'outil, Jean-Pierre a vu ses droits administratifs s'évaporer dans le labyrinthe des assurances. Aujourd'hui, on le croise Place de la Bourse. Il ne mendie pas ; il observe les façades avec la précision d'un maître d'œuvre. Son regard analyse encore la verticalité des structures, comme pour s'assurer que le monde tient encore debout, même si lui a vacillé. Sa dignité est un manteau de laine toujours brossé, un vestige de son ancienne vie de chef d'équipe qui refuse de céder au chaos du pavé.", 
    needs: "- Chaussures de marche technique Gore-Tex (Taille 44) pour une imperméabilité totale\n- Sac de couchage grand froid (confort -10°C) de qualité expédition\n- Kit d'hygiène complet avec rasoir de sécurité et baume protecteur pour le visage\n- Pantalon de travail renforcé type Cordura pour la résistance thermique\n- Carnet de croquis à grain fin et crayons graphite (HB, 2B) pour dessiner les structures\n- Abonnement mensuel STIB (Réseau Bruxelles) pour les rendez-vous de réinsertion\n- Lampe frontale puissante (300 lumens) pour la lecture nocturne", 
    usual_place: 'Place de la Bourse', 
    is_public: true, 
    is_verified: true, 
    is_archived: false 
  },
  { 
    publicId: 'fatima-midi-master', 
    name: 'Fatima', 
    image_url: 'https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=crop&q=80&w=800', 
    raw_story: 'Aide-ménagère diplomatique. Séparation difficile. Expulsion de logement.', 
    reformulated_story: "Fatima était la gardienne silencieuse de l'éclat diplomatique. En tant qu'aide-ménagère de haut vol pour les résidences d'ambassadeurs, elle maîtrisait l'alchimie des tissus fragiles et la géométrie parfaite d'une table de réception. Son monde était celui du luxe discret, de l'ordre absolu et de la discrétion totale. La rupture n'a pas été un accident, mais une érosion : une séparation conjugale brutale suivie d'une expulsion liée à un bail non déclaré. Sans adresse, ses références prestigieuses sont devenues inutilisables. Dans le tumulte minéral de la Gare du Midi, Fatima maintient un périmètre de propreté méticuleux autour de son maigre bagage. Elle ne s'assoit jamais par terre ; elle reste debout, droite, habituée à la station prolongée du service. Son foulard, toujours impeccablement noué, est son dernier rempart contre l'invisibilité. Elle parle de l'entretien des parquets anciens comme d'une poésie perdue. Sa déchéance n'est pas une perte de compétences, c'est une perte de scène pour les exercer. Elle attend un nouveau seuil à franchir, une porte à ouvrir avec la clé de la confiance.", 
    needs: "- Valise à roulettes rigide (format cabine) pour sécuriser ses effets personnels\n- Trousse de toilette hermétique avec produits de soin dermatologiques\n- Manteau d'hiver long en laine ou coupe-vent technique élégant (Taille L)\n- Smartphone reconditionné avec forfait data pour la recherche d'emploi en ligne\n- Carte de lavage prépayée pour laverie automatique (Forfait 10 cycles)\n- Chaussures de ville confortables et sobres pour entretiens (Pointure 39)\n- Chèques-repas pour l'accès à une alimentation équilibrée", 
    usual_place: 'Gare du Midi', 
    is_public: true, 
    is_verified: true, 
    is_archived: false 
  },
  { 
    publicId: 'marc-schuman-master', 
    name: 'Marc', 
    image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800', 
    raw_story: 'Administrateur système réseaux. Burn-out sévère. Rupture avec la technologie.', 
    reformulated_story: "Marc est un architecte de l'immatériel dont les propres serveurs internes ont grillé. Ancien administrateur système pour des cabinets de conseil au Quartier Schuman, il passait ses journées à stabiliser des infrastructures critiques et à anticiper les cyber-attaques. La rupture s'appelle 'burn-out de saturation' : un effondrement cognitif total où la lumière des écrans et le bourdonnement des serveurs sont devenus physiquement insupportables. Marc a fui la technologie pour la rue, pensant y trouver le silence. Mais le Quartier Européen, avec ses flux incessants, le rattrape. Il vit désormais au pied des bâtiments qu'il configurait autrefois. Sa gestuelle de dignité est fascinante : il répare bénévolement les smartphones des autres sans-abri, utilisant un petit kit de tournevis de précision comme un chirurgien. Il refuse d'utiliser un ordinateur pour lui-même, mais il protège un exemplaire corné de 'L'Éthique' de Spinoza dans son sac. Pour Marc, la rue est un système d'exploitation défaillant qu'il tente de comprendre sans pouvoir le rebooter. Son intelligence est intacte, mais son interface avec la société est brisée.", 
    needs: "- Batterie externe (Powerbank) solaire haute capacité (20000mAh+) pour ses réparations\n- Kit d'outils de précision pour électronique (Type iFixit)\n- Sac à dos étanche et renforcé anti-vol (Volume 30L)\n- Lunettes de vue avec filtre anti-lumière bleue (correction standard)\n- Veste technique imperméable respirante type Softshell (Taille XL)\n- Carte SIM prépayée pour maintenir l'accès aux portails de santé\n- Ouvrages de philosophie ou de sociologie (format poche)", 
    usual_place: 'Quartier Schuman', 
    is_public: true, 
    is_verified: false, 
    is_archived: false 
  }
];

const AdminDashboard: React.FC = () => {
  const [listeProfils, setListeProfils] = useState<Profil[]>([]);
  const [chargement, setChargement] = useState(true);
  const [dbStatus, setDbStatus] = useState<{ok: boolean; message: string; url: string} | null>(null);
  const [ongletActif, setOngletActif] = useState<'actifs' | 'archives'>('actifs');
  const [recherche, setRecherche] = useState('');
  const [notification, setNotification] = useState<{message: string, type: 'succes' | 'erreur'} | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const chargerDonnees = useCallback(async () => {
    setChargement(true);
    try {
      const status = await testerConnexion();
      setDbStatus(status);
      if (status.ok) {
        const donnees = await obtenirProfils();
        setListeProfils(donnees);
      }
    } catch (e) {
      setNotification({ message: "Erreur de chargement des données", type: 'erreur' });
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    chargerDonnees();
  }, [chargerDonnees]);

  const handleRestore = async () => {
    setChargement(true);
    try {
      await peuplerSupabase(SEED_DATA_PROFILES as Profil[]);
      setNotification({ message: "Indexation Maître réussie !", type: 'succes' });
      await chargerDonnees();
    } catch (e: any) {
      setNotification({ message: `Erreur d'import : ${e.message}`, type: 'erreur' });
    } finally {
      setChargement(false);
    }
  };

  const gererArchive = async (id: string) => {
    try {
      await basculerArchiveProfil(id);
      setNotification({ message: "Statut d'archivage mis à jour", type: 'succes' });
      chargerDonnees();
    } catch (e: any) {
      setNotification({ message: "Action bloquée par le serveur.", type: 'erreur' });
    }
  };

  const gererSuppression = async (id: string) => {
    if (!window.confirm("CONFIRMATION REQUISE : Supprimer définitivement ce dossier d'existence ?")) return;
    try {
      await supprimerProfil(id);
      setNotification({ message: "Dossier supprimé du registre", type: 'succes' });
      chargerDonnees();
    } catch (e: any) {
      setNotification({ message: "Erreur lors de la suppression.", type: 'erreur' });
    }
  };

  const profilsFiltres = useMemo(() => {
    const terme = recherche.toLowerCase();
    return listeProfils.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(terme) || (p.usual_place || "").toLowerCase().includes(terme);
      const matchTab = ongletActif === 'archives' ? p.is_archived : !p.is_archived;
      return matchSearch && matchTab;
    });
  }, [listeProfils, recherche, ongletActif]);

  return (
    <div className="min-h-screen bg-[#f8f7f4] dark:bg-stone-950 pb-40">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-stone-200 dark:border-stone-800 pb-12">
          <div className="space-y-4">
            <h1 className="text-6xl font-impact text-stone-900 dark:text-white uppercase tracking-tighter leading-none">
              REGISTRE NATIONAL
            </h1>
            <p className="font-serif italic text-stone-500 text-xl">Administration des fiches de dignité.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className={`flex flex-col px-6 py-4 rounded-3xl border-2 transition-colors ${dbStatus?.ok ? 'border-green-500/20 bg-green-50/50 text-green-700' : 'border-red-500/20 bg-red-50 text-red-700'} shadow-sm`}>
               <div className="flex items-center gap-3 mb-1">
                 {dbStatus?.ok ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                 <span className="font-mono text-[8px] font-black uppercase tracking-widest opacity-60">Status Réseau</span>
               </div>
               <p className="font-impact text-xl uppercase tracking-wider leading-none">
                 {dbStatus?.ok ? 'SYNCHRONISÉ' : 'DÉCONNECTÉ'}
               </p>
            </div>
            <button onClick={chargerDonnees} disabled={chargement} className="p-4 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl paper-shadow hover:bg-stone-50 transition-colors disabled:opacity-50">
               <RefreshCw className={`w-5 h-5 ${chargement ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {dbStatus?.ok && listeProfils.length === 0 && !chargement && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-stone-900 p-16 rounded-[4rem] text-center space-y-8 shadow-2xl relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
             <Database className="w-20 h-20 text-blue-500 mx-auto relative z-10" />
             <div className="space-y-4 relative z-10">
               <h2 className="text-6xl font-impact text-white uppercase leading-none">Indexation Requise</h2>
               <p className="font-serif italic text-stone-400 text-2xl max-w-2xl mx-auto">
                 La base de données est vierge. Injectez les trajectoires de vie de référence pour initialiser le système.
               </p>
             </div>
             <button onClick={handleRestore} className="px-16 py-8 bg-blue-600 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-xl relative z-10">
                Restaurer l'Index Maître
             </button>
          </motion.div>
        )}

        {dbStatus?.ok && listeProfils.length > 0 && (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <nav className="flex bg-white dark:bg-stone-900 p-2 rounded-[2rem] border border-stone-100 dark:border-stone-800 paper-shadow">
                {(['actifs', 'archives'] as const).map(onglet => (
                  <button key={onglet} onClick={() => setOngletActif(onglet)} className={`px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${ongletActif === onglet ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-xl' : 'text-stone-300 hover:text-stone-600'}`}>
                    {onglet}
                  </button>
                ))}
              </nav>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 w-5 h-5" />
                <input type="search" value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="FILTRER PAR NOM OU LIEU..." className="w-full bg-white dark:bg-stone-900 pl-16 pr-8 py-5 rounded-full border border-stone-100 dark:border-stone-800 paper-shadow outline-none font-mono text-[10px] uppercase focus:border-blue-500 transition-colors" />
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 rounded-[4rem] border border-stone-100 dark:border-stone-800 paper-shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-stone-50/50 dark:bg-stone-800/50 font-mono text-[10px] uppercase tracking-[0.4em] text-stone-400">
                    <tr>
                      <th className="px-12 py-10">Citoyen</th>
                      <th className="px-12 py-10">Zone d'Existence</th>
                      <th className="px-12 py-10">Statut IA</th>
                      <th className="px-12 py-10 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50 dark:divide-stone-800">
                    {profilsFiltres.map((p) => (
                      <tr key={p.id} className="group hover:bg-stone-50/30 dark:hover:bg-stone-800/30 transition-colors">
                        <td className="px-12 py-10">
                          <div className="font-serif font-black text-stone-900 dark:text-white text-2xl uppercase tracking-tight">{p.name}</div>
                          <div className="font-mono text-[8px] text-stone-300 mt-1 uppercase">ID: {p.publicId.split('-').pop()}</div>
                        </td>
                        <td className="px-12 py-10">
                          <div className="flex items-center gap-3 text-stone-500 font-serif italic text-lg">
                             <MapPin className="w-4 h-4 text-blue-600" /> {p.usual_place}
                          </div>
                        </td>
                        <td className="px-12 py-10">
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-[8px] uppercase tracking-widest ${p.is_verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {p.is_verified ? 'Vérifié' : 'En attente'}
                          </div>
                        </td>
                        <td className="px-12 py-10 text-right">
                          <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link to={`/admin/edit/${p.publicId}`} title="Modifier" className="p-4 bg-white dark:bg-stone-800 rounded-2xl border border-stone-100 hover:bg-stone-900 hover:text-white transition-all shadow-sm"><Edit2 className="w-5 h-5" /></Link>
                            <button onClick={() => gererArchive(p.id)} title={p.is_archived ? "Désarchiver" : "Archiver"} className="p-4 bg-white dark:bg-stone-800 rounded-2xl border border-stone-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm">{p.is_archived ? <RotateCcw className="w-5 h-5" /> : <Archive className="w-5 h-5" />}</button>
                            <button onClick={() => gererSuppression(p.id)} title="Supprimer" className="p-4 bg-white dark:bg-stone-800 rounded-2xl border border-stone-100 hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 className="w-5 h-5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, x: 50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 50, scale: 0.9 }} className={`fixed bottom-10 right-10 z-[100] px-10 py-6 rounded-[2.5rem] flex items-center gap-6 shadow-2xl border bg-stone-900 text-white border-white/10`}>
            {notification.type === 'succes' ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <AlertCircle className="w-6 h-6 text-red-500" />}
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-6 opacity-30 hover:opacity-100 transition-opacity"><X className="w-5 h-5" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
