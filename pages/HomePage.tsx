
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen bg-[#f8f7f4] flex flex-col items-center justify-center overflow-hidden"
    >
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        animate={{ 
          background: isHovered 
            ? 'radial-gradient(circle at 50% 50%, #003399 0%, transparent 70%)' 
            : 'radial-gradient(circle at 50% 50%, #1c1917 0%, transparent 70%)' 
        }}
      />

      <div className="relative z-10 w-full max-w-7xl px-6 py-20">
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          <div className="overflow-hidden mb-4">
            <motion.span 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="block text-[10px] font-extrabold uppercase tracking-[0.6em] text-stone-400 mb-2"
            >
              Bruxelles • Human Visibility
            </motion.span>
          </div>
          
          <h1 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => navigate('/profiles')}
            className="font-impact text-[28vw] md:text-[22vw] leading-[0.75] tracking-tighter text-stone-900 cursor-pointer select-none transition-all duration-700 hover:scale-[1.01] active:scale-95"
          >
            J'EXISTE
          </h1>

          <div className="mt-20 flex flex-col items-center gap-8 w-full">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="max-w-md text-center font-serif text-xl md:text-2xl italic text-stone-500 leading-relaxed mb-4"
            >
              "Derrière chaque regard croisé dans les rues de Bruxelles se cache une épopée."
            </motion.p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/profiles')}
                className="group relative px-12 py-6 bg-stone-900 text-white rounded-full overflow-hidden transition-all hover:bg-blue-700 shadow-2xl"
              >
                <span className="relative z-10 font-black text-xs uppercase tracking-widest">Voir l'Index</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-12 right-12 text-right hidden md:block">
        <div className="text-[10px] font-black text-stone-300 uppercase tracking-tighter mb-1">Bruxelles</div>
        <div className="text-xs font-mono text-stone-400">50.8503° N, 4.3517° E</div>
      </div>
    </motion.div>
  );
};

export default HomePage;
