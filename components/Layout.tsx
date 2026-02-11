
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Shield, 
  Menu, 
  X, 
  Heart, 
  Sparkles,
  MapPin,
  Eye,
  LogOut,
  Settings,
  User as UserIcon,
  Bell,
  Search,
  ChevronDown,
  Sun,
  Moon,
  Globe,
  Lock,
  HelpCircle,
  Unlock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });
  
  const notifications = [
    { id: 1, title: 'Nouveau profil', message: 'Jean a été ajouté par Marie', time: 'Il y a 5 min', read: false },
    { id: 2, title: 'Besoin urgent', message: 'Fatima a besoin de médicaments', time: 'Il y a 2 heures', read: true },
    { id: 3, title: 'Statistiques', message: '15 nouvelles vues cette semaine', time: 'Il y a 1 jour', read: true },
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Navigation toujours visible pour l'espace pro démo
  const navItems = [
    { path: '/', label: 'Accueil', icon: Home, exact: true },
    { path: '/profiles', label: 'Index Public', icon: Users },
    { path: '/admin', label: 'Espace Pro', icon: Shield },
    { path: '/admin/new', label: 'Nouveau Profil', icon: Sparkles },
  ];

  const isActive = (path: string, exact: boolean = false) => {
    return exact ? location.pathname === path : location.pathname.startsWith(path);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const userMenuItems = [
    { label: 'Mon profil', icon: UserIcon, onClick: () => navigate('/admin/profile') },
    { label: 'Paramètres', icon: Settings, onClick: () => navigate('/admin/settings') },
    { label: 'Déconnexion', icon: LogOut, onClick: handleLogout, danger: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-gray-200 dark:border-gray-700'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <Logo className="w-12 h-12" />
                <div className="hidden sm:block">
                  <span className="text-3xl font-impact text-stone-900 uppercase tracking-tighter">
                    J'existe
                  </span>
                  <div className="text-[9px] text-stone-400 font-black uppercase tracking-widest leading-none">
                    Bruxelles • Social Registry
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const active = isActive(item.path, item.exact);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-6 py-2.5 rounded-full transition-all group ${
                      active
                        ? 'bg-stone-900 text-white shadow-xl'
                        : 'text-stone-400 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${active ? 'text-blue-400' : 'group-hover:text-blue-600'}`} />
                    <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full hover:bg-stone-50 transition-colors text-stone-300 hover:text-stone-900"
                aria-label="Changer de thème"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 rounded-full hover:bg-stone-50 transition-colors text-stone-300 hover:text-stone-900 relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden z-50"
                    >
                      <div className="p-6 border-b border-stone-50">
                        <h3 className="font-impact text-xl text-stone-900">ALERTES SYSTÈME</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-5 border-b border-stone-50 hover:bg-stone-50 cursor-pointer transition-colors ${
                              !notification.read ? 'bg-blue-50/30' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-4">
                              <div className="shrink-0 w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-stone-100">
                                <Bell className="w-4 h-4 text-stone-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-sm text-stone-900">{notification.title}</h4>
                                <p className="text-xs text-stone-500 mt-1 font-serif italic">
                                  {notification.message}
                                </p>
                                <p className="text-[9px] font-black uppercase text-stone-300 mt-3 tracking-widest">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Status démo */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                <Unlock className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Mode Démo</span>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2.5 rounded-full hover:bg-stone-50 text-stone-900 transition-colors"
                aria-label="Menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-stone-50 overflow-hidden"
            >
              <div className="px-6 py-8 space-y-4">
                {navItems.map((item) => {
                  const active = isActive(item.path, item.exact);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${
                        active
                          ? 'bg-stone-900 text-white shadow-lg'
                          : 'bg-stone-50 text-stone-400'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            {/* Brand */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Logo className="w-14 h-14" />
                <div>
                  <span className="text-3xl font-impact text-stone-900 uppercase leading-none">J'existe</span>
                  <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest mt-1">Plateforme de Visibilité</p>
                </div>
              </div>
              <p className="font-serif italic text-lg text-stone-500 leading-relaxed">
                Donner une voix à celles et ceux qui vivent l'invisibilité dans les rues de Bruxelles. 
                Parce que chaque existence mérite d'être inscrite.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-impact text-xl text-stone-900 uppercase tracking-tight mb-8">Navigation</h3>
              <ul className="space-y-4">
                <li>
                  <Link to="/" className="text-stone-400 hover:text-stone-900 font-black text-[10px] uppercase tracking-widest transition-colors">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link to="/profiles" className="text-stone-400 hover:text-stone-900 font-black text-[10px] uppercase tracking-widest transition-colors">
                    Index des Profils
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="text-stone-400 hover:text-stone-900 font-black text-[10px] uppercase tracking-widest transition-colors">
                    Espace Travailleur Social
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-impact text-xl text-stone-900 uppercase tracking-tight mb-8">Ressources</h3>
              <ul className="space-y-4">
                <li>
                  <Link to="/faq" className="text-stone-400 hover:text-stone-900 font-black text-[10px] uppercase tracking-widest transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-stone-400 hover:text-stone-900 font-black text-[10px] uppercase tracking-widest transition-colors">
                    Confidentialité
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-stone-400 hover:text-stone-900 font-black text-[10px] uppercase tracking-widest transition-colors">
                    Mentions Légales
                  </Link>
                </li>
                <li>
                  <Link to="/partners" className="text-stone-400 hover:text-stone-900 font-black text-[10px] uppercase tracking-widest transition-colors">
                    Partenaires
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Social */}
            <div className="space-y-8">
              <h3 className="font-impact text-xl text-stone-900 uppercase tracking-tight">Contact</h3>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Plateforme Opérationnelle</p>
                <a
                  href="mailto:contact@jexiste.org"
                  className="text-2xl font-serif font-bold italic text-stone-900 hover:text-blue-600 transition-colors"
                >
                  contact@jexiste.org
                </a>
              </div>
              <div className="flex space-x-4 pt-4">
                <button className="p-3 bg-stone-50 rounded-xl hover:bg-stone-900 hover:text-white transition-all">
                  <Globe className="w-5 h-5" />
                </button>
                <button className="p-3 bg-stone-50 rounded-xl hover:bg-stone-900 hover:text-white transition-all">
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-24 pt-10 border-t border-stone-50 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-300">
              © {new Date().getFullYear()} J'existe — Registre de Visibilité Sociale • Bruxelles
            </p>
            <div className="flex items-center gap-2 text-stone-200">
               <Heart className="w-3 h-3 fill-current text-red-500" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em]">Restaurer l'Invisibilité</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default React.memo(Layout);
