import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showSignature, setShowSignature] = useState(false);

  const handleClick = useCallback(() => {
    setIsClicked(true);
    // Animation avant la navigation
    setTimeout(() => {
      navigate('/profiles');
    }, 800);
  }, [navigate]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    // Animation séquentielle au chargement
    const timer1 = setTimeout(() => setShowSubtitle(true), 1200);
    const timer2 = setTimeout(() => setShowSignature(true), 1800);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className="relative flex flex-col items-center justify-center min-h-screen bg-white cursor-pointer overflow-hidden select-none"
      role="button"
      aria-label="Accéder aux profils"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* Cursor trail effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            key="cursor-trail"
            className="absolute w-24 h-24 rounded-full pointer-events-none"
            style={{
              left: cursorPosition.x - 48,
              top: cursorPosition.y - 48,
              background: 'radial-gradient(circle, rgba(0,0,0,0.1) 0%, transparent 70%)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Background transition overlay */}
      <motion.div
        className="absolute inset-0 bg-black z-0"
        initial={{ scale: 0 }}
        animate={{ scale: isClicked ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* Main content */}
      <div className="relative z-10 w-full text-center px-4">
        {/* Title */}
        <motion.h1
          className="font-impact text-[20vw] md:text-[25vw] lg:text-[180px] tracking-tight leading-none"
          animate={{
            color: isClicked ? '#ffffff' : '#000000',
            scale: isHovered ? 1.02 : 1,
            letterSpacing: isHovered ? '-0.05em' : '0em',
          }}
          transition={{
            color: { duration: 0.3 },
            scale: { type: "spring", stiffness: 300, damping: 15 },
          }}
          style={{
            textShadow: isHovered 
              ? '0 0 30px rgba(0, 0, 0, 0.1)' 
              : 'none',
          }}
        >
          <span className="block relative">
            <span className="relative z-10">J'EXISTE</span>
            {/* Underline effect on hover */}
            <motion.span
              className="absolute bottom-0 left-1/2 w-0 h-1 bg-black"
              initial={false}
              animate={{
                width: isHovered ? '100%' : '0%',
                left: isHovered ? '0%' : '50%',
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ duration: 0.5 }}
            />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <AnimatePresence>
          {(showSubtitle || isHovered) && (
            <motion.div
              key="subtitle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5, delay: isHovered ? 0 : 0.2 }}
              className="mt-8 md:mt-12"
            >
              <p className="text-gray-600 group-hover:text-white font-serif italic text-xl md:text-2xl tracking-[0.2em]">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.05 }}
                >
                  {'Entrer dans la rencontre'.split('').map((char, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click prompt */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: showSubtitle ? 0.6 : 0 }}
          transition={{ delay: 2 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
            <motion.span
              className="text-sm text-gray-500 font-medium"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Cliquez pour entrer
            </motion.span>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Signature */}
      <AnimatePresence>
        {showSignature && (
          <motion.div
            key="signature"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1, delay: 2.2 }}
            className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-10"
          >
            <div className="max-w-xs">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.1em] leading-tight">
                HOMMAGE À L'EXISTENCE<br />DES INVISIBLES
              </p>
            </div>
            <div className="text-gray-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-px bg-gray-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Sound indicator (visual only) */}
      <motion.div
        className="absolute top-8 right-8 flex items-center gap-2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 2.5 }}
      >
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1 bg-gray-400 rounded-full"
              style={{ height: `${i * 4}px` }}
              animate={{
                height: [`${i * 4}px`, `${i * 6}px`, `${i * 4}px`],
              }}
              transition={{
                duration: 0.5 + i * 0.1,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
        <span className="text-xs text-gray-400 font-mono">SOBRIÉTÉ POÉTIQUE</span>
      </motion.div>
    </motion.div>
  );
};

export default React.memo(HomePage);