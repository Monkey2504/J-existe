
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
import { useAuth } from '../contexts/AuthContext.tsx';
import Logo from './Logo.tsx';
import MobileNav from './MobileNav.tsx';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const localisation = useLocation();
  const navigation = useNavigate();
  const { logout } = useAuth();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [estDefile, setEstDefile] = useState(false);
  const [theme, setTheme] = useState<'clair' | 'sombre'>(() => {
    const sauvegarde = localStorage.getItem('theme_jexiste');
    return (sauvegarde as 'clair' | 'sombre') || 'clair';
  });
  
  const elementsNav = [
    { chemin: '/', etiquette: 'Accueil', icone: Home, exact: true },
    { chemin: '/profiles', etiquette: 'Index', icone: Users },
    { chemin: '/admin', etiquette: 'Admin', icone: Shield },
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
      <header role="banner" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${estDefile ? 'bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl shadow-lg border-b border-stone-200 dark:border-stone-800' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3" aria-label="Retour à l'accueil">
                <Logo className="w-10 h-10" />
                <div className="hidden sm:block">
                  <span className="text-2xl font-impact text-stone-900 dark:text-white uppercase tracking-tighter">J'existe</span>
                </div>
              </Link>
            </div>

            <nav className="hidden lg:flex items-center space-x-1" role="navigation">
              {elementsNav.map((item) => {
                const actif = estActif(item.chemin, item.exact);
                return (
                  <Link key={item.chemin} to={item.chemin} className={`flex items-center space-x-2 px-6 py-2.5 rounded-full transition-all group ${actif ? 'bg-stone-900 dark:bg-white dark:text-stone-900 text-white shadow-xl' : 'text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-stone-800'}`}>
                    <item.icone className="w-4 h-4" />
                    <span className="font-black text-[9px] uppercase tracking-[0.2em]">{item.etiquette}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-4">
              <button onClick={basculerTheme} className="p-2.5 rounded-full hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-stone-300 hover:text-stone-900 dark:hover:text-white">
                {theme === 'clair' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button onClick={() => setMenuOuvert(!menuOuvert)} className="lg:hidden p-2.5 rounded-full hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-900 dark:text-white">
                {menuOuvert ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {menuOuvert && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="lg:hidden bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 overflow-hidden">
              <nav className="p-6 space-y-4">
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

      <main id="contenu-principal" className="pt-20 pb-24 lg:pb-0 outline-none">{children}</main>

      <MobileNav />

      <footer className="hidden lg:block bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-4"><Logo className="w-10 h-10" /><span className="text-xl font-impact uppercase tracking-wider">J'existe</span></div>
           <p className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-300">© {new Date().getFullYear()} J'existe • Bruxelles</p>
        </div>
      </footer>
    </div>
  );
};

export default React.memo(Layout);
