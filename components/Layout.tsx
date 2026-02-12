
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Shield, 
  Menu, 
  X, 
  Sparkles,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import MobileNav from './MobileNav';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const localisation = useLocation();
  const navigation = useNavigate();
  const { logout } = useAuth();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [estDefile, setEstDefile] = useState(false);
  const [afficherAlertes, setAfficherAlertes] = useState(false);
  const [theme, setTheme] = useState<'clair' | 'sombre'>(() => {
    const sauvegarde = localStorage.getItem('theme_jexiste');
    return (sauvegarde as 'clair' | 'sombre') || 'clair';
  });
  
  const alertes = [
    { id: 1, titre: 'Nouveau profil', message: 'Jean a été ajouté au registre', temps: '5 min', lu: false },
    { id: 2, titre: 'Besoin urgent', message: 'Ahmed signale un besoin critique', temps: '2 heures', lu: true },
  ];

  const alertesNonLues = alertes.filter(a => !a.lu).length;

  const elementsNav = [
    { chemin: '/', etiquette: 'Accueil', icone: Home, exact: true },
    { chemin: '/profiles', etiquette: 'Index Public', icone: Users },
    { chemin: '/admin', etiquette: 'Console Pro', icone: Shield },
    { chemin: '/admin/new', etiquette: 'Nouveau Dossier', icone: Sparkles },
  ];

  const estActif = useCallback((chemin: string, exact: boolean = false) => {
    return exact ? localisation.pathname === chemin : localisation.pathname.startsWith(chemin);
  }, [localisation.pathname]);

  useEffect(() => {
    const gererDefilement = () => setEstDefile(window.scrollY > 20);
    window.addEventListener('scroll', gererDefilement, { passive: true });
    return () => window.removeEventListener('scroll', gererDefilement);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'sombre');
    localStorage.setItem('theme_jexiste', theme);
  }, [theme]);

  const basculerTheme = useCallback(() => {
    setTheme(prev => prev === 'clair' ? 'sombre' : 'clair');
  }, []);

  return (
    <div className="min-h-screen bg-[#fdfcfb] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-300">
      <a href="#contenu-principal" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-4 focus:bg-blue-600 focus:text-white focus:rounded-xl focus:font-black focus:uppercase focus:text-[10px] focus:tracking-widest">Passer au contenu principal</a>

      <header role="banner" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${estDefile ? 'bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl shadow-lg border-b border-stone-200 dark:border-stone-800' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3" aria-label="Retour à l'accueil">
                <Logo className="w-10 h-10" />
                <div className="hidden sm:block">
                  <span className="text-2xl font-impact text-stone-900 dark:text-white uppercase tracking-tighter">J'existe</span>
                  <div className="text-[8px] text-stone-400 font-black uppercase tracking-widest leading-none">Registre Social • Bruxelles</div>
                </div>
              </Link>
            </div>

            <nav className="hidden lg:flex items-center space-x-1" role="navigation">
              {elementsNav.map((item) => {
                const actif = estActif(item.chemin, item.exact);
                return (
                  <Link key={item.chemin} to={item.chemin} aria-current={actif ? 'page' : undefined} className={`flex items-center space-x-2 px-6 py-2.5 rounded-full transition-all group ${actif ? 'bg-stone-900 dark:bg-white dark:text-stone-900 text-white shadow-xl' : 'text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-stone-800'}`}>
                    <item.icone className={`w-4 h-4 ${actif ? 'text-blue-400' : 'group-hover:text-blue-600'}`} />
                    <span className="font-black text-[9px] uppercase tracking-[0.2em]">{item.etiquette}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button onClick={basculerTheme} className="p-2.5 rounded-full hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-stone-300 hover:text-stone-900 dark:hover:text-white" aria-label={`Passer au mode ${theme === 'clair' ? 'sombre' : 'clair'}`}>
                {theme === 'clair' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              <div className="relative">
                <button onClick={() => setAfficherAlertes(!afficherAlertes)} className="p-2.5 rounded-full hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-stone-300 hover:text-stone-900 dark:hover:text-white relative" aria-label="Alertes système" aria-expanded={afficherAlertes} aria-haspopup="true">
                  <Bell className="w-5 h-5" />
                  {alertesNonLues > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white dark:border-stone-900" />}
                </button>
                <AnimatePresence>
                  {afficherAlertes && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-4 w-72 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-100 dark:border-stone-800 overflow-hidden z-50">
                      <div className="p-4 border-b border-stone-50 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50"><h3 className="font-impact text-lg uppercase tracking-wider">Alertes</h3></div>
                      <div className="max-h-64 overflow-y-auto">
                        {alertes.map((a) => (
                          <div key={a.id} className="p-4 border-b border-stone-50 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                            <h4 className="font-bold text-xs text-stone-900 dark:text-white">{a.titre}</h4>
                            <p className="text-[10px] text-stone-500 mt-1 font-serif italic">{a.message}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={() => setMenuOuvert(!menuOuvert)} className="lg:hidden p-2.5 rounded-full hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-900 dark:text-white" aria-label="Menu principal" aria-expanded={menuOuvert}>
                {menuOuvert ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {menuOuvert && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="lg:hidden bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 overflow-hidden">
              <nav className="p-6 space-y-4" role="navigation">
                {elementsNav.map((item) => (
                  <Link key={item.chemin} to={item.chemin} onClick={() => setMenuOuvert(false)} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800">
                    <item.icone className="w-5 h-5 text-blue-600" />
                    <span className="font-impact text-xl uppercase tracking-wider">{item.etiquette}</span>
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="contenu-principal" className="pt-20 pb-24 lg:pb-0 outline-none" tabIndex={-1}>{children}</main>

      <MobileNav />

      <footer className="hidden lg:block bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 mt-20" role="contentinfo">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-4"><Logo className="w-10 h-10" /><span className="text-xl font-impact uppercase tracking-wider">J'existe</span></div>
           <p className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-300">© {new Date().getFullYear()} J'existe — Registre de Visibilité Sociale • Bruxelles</p>
        </div>
      </footer>
    </div>
  );
};

export default React.memo(Layout);
