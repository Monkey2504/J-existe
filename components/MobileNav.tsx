
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, PlusCircle, Shield, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileNav: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/profiles', icon: Search, label: 'Explorer' },
    { path: '/je-cree-ma-fiche', icon: PlusCircle, label: 'Saisir', highlight: true },
    { path: '/admin', icon: Shield, label: 'Admin' }
  ];

  const isActive = (path: string) => {
    if (path === '/' ) return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] px-4 pb-6 pt-2 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-t border-stone-200 dark:border-stone-800 safe-area-bottom">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className="flex flex-col items-center gap-1 min-w-[64px] relative"
            >
              <div className={`p-2 rounded-2xl transition-all ${
                item.highlight 
                  ? 'bg-blue-600 text-white shadow-lg -translate-y-4 border-4 border-[#fdfcfb] dark:border-stone-950' 
                  : active ? 'text-blue-600' : 'text-stone-400'
              }`}>
                <item.icon className={item.highlight ? "w-6 h-6" : "w-5 h-5"} />
              </div>
              {!item.highlight && (
                <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-blue-600' : 'text-stone-400'}`}>
                  {item.label}
                </span>
              )}
              {active && !item.highlight && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -top-2 w-1 h-1 bg-blue-600 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default React.memo(MobileNav);
